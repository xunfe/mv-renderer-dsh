/**
 * MV 合集 · DSH Host 插件
 * - 把内置的默认 MV（P(doom)）挂在 /mv-hub/site/，页面用 React 渲染，播放时内嵌这层画面。
 * - 其他合集包按需从 Cloudflare R2 下载到 dataDir/pkgs/<pkg>，挂到 /custom/<pkg>/（和软件版同一套路径）。
 * - 给 DSH 提供列表 / 源码 / 画面 / 下载四个工具，源码与画面都落在包内的 ref/ 下。
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const dl = require('./lib/mv-dl.cjs');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(ROOT, 'web');
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4',
  '.wav': 'audio/wav', '.flac': 'audio/flac', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8',
};
const mime = (p) => MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';

function json(res, obj, code = 200) {
  const b = Buffer.from(JSON.stringify(obj), 'utf8');
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': b.length, 'Cache-Control': 'no-store' });
  res.end(b);
}

function text(res, code, body) {
  const b = Buffer.from(String(body), 'utf8');
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': b.length });
  res.end(b);
}

function serveFile(req, res, file) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return text(res, 404, '404');
    const total = st.size;
    let start = 0, end = total - 1, code = 200;
    const range = req.headers.range;
    if (range && range.startsWith('bytes=')) {
      const spec = range.slice(6).split(',').shift().trim();
      const [a, b] = spec.split('-');
      if (a === '') start = Math.max(0, total - parseInt(b, 10));
      else { start = parseInt(a, 10); if (b) end = Math.min(parseInt(b, 10), total - 1); }
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + total }); return res.end();
      }
      code = 206;
    }
    const headers = { 'Content-Type': mime(file), 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    if (code === 206) headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
    res.writeHead(code, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
  });
}


const SITE_PREFIXES = ['/assets/', '/audio/', '/data/', '/covers/', '/fonts/', '/pdoom-perf.js', '/rec-ui.js', '/mv-return.js', '/mv-start.js', '/mv-quality.js', '/mv-progress.js'];

function serveSite(req, res, file) {
  const ext = path.extname(file).toLowerCase();
  const texty = ['.html', '.js', '.mjs', '.css', '.svg'].includes(ext);
  if (!texty) return serveFile(req, res, file);
  fs.readFile(file, 'utf8', (err, body) => {
    if (err) return text(res, 404, '404');
    let out = body;
    for (const pre of SITE_PREFIXES) out = out.split('"' + pre).join('"/mv-hub/site' + pre).split("'" + pre).join("'/mv-hub/site" + pre);
    const b = Buffer.from(out, 'utf8');
    res.writeHead(200, { 'Content-Type': mime(file), 'Content-Length': b.length, 'Cache-Control': 'no-cache' });
    res.end(b);
  });
}

function safeRel(rel) {
  const p = path.resolve('/', rel).slice(1);
  if (p.split('/').some((s) => s === '..')) return null;
  return p;
}

export const inject = ['tools', 'webServer'];

export function apply(ctx) {
  const dataDir = process.env.MV_HUB_DIR || path.join(process.env.DSH_HOME || '/root/.dsh', 'mv-hub');
  const pkgsDir = path.join(dataDir, 'pkgs');
  fs.mkdirSync(pkgsDir, { recursive: true });

  const installed = () => {
    const out = {};
    for (const p of Object.keys(CATALOG.packages)) {
      out[p] = fs.existsSync(path.join(pkgsDir, p, 'pkg.json'));
    }
    return out;
  };

  /* ---------- /mv-hub ---------- */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/mv-hub',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url, 'http://127.0.0.1');
        const p = decodeURIComponent(u.pathname);
        if (p === '/mv-hub/api/catalog') return json(res, { ...CATALOG, installed: installed() });
        if (p === '/mv-hub/api/installed') return json(res, installed());
        if (p === '/mv-hub/api/dl' && req.method === 'POST') {
          const pkg = u.searchParams.get('pkg');
          const P = CATALOG.packages[pkg];
          if (!P) return json(res, { ok: false, error: '没有这个合集包' }, 404);
          try {
            dl.startDownload({ pkg, url: P.url, sha256: P.sha256, size: P.bytes, mvRoot: pkgsDir });
            return json(res, { ok: true });
          } catch (e) { return json(res, { ok: false, error: e.message }, 400); }
        }
        if (p === '/mv-hub/api/dl/status') return json(res, dl.status(u.searchParams.get('id')));
        if (p === '/mv-hub/api/dl/cancel') return json(res, { ok: dl.cancel(u.searchParams.get('id')) });
        if (p === '/mv-hub/api/source') {
          const id = u.searchParams.get('id');
          const mv = CATALOG.mvs.find((m) => m.id === id);
          if (!mv) return json(res, { ok: false, error: '没有这支 MV' }, 404);
          const dir = path.join(ROOT, 'ref', 'code', id);
          const rel = u.searchParams.get('file');
          if (!rel) {
            const list = [];
            const walk = (d, base) => {
              for (const e of fs.readdirSync(d, { withFileTypes: true })) {
                const f = path.join(d, e.name);
                if (e.isDirectory()) walk(f, base);
                else list.push({ file: path.relative(base, f).replace(/\\/g, '/'), bytes: fs.statSync(f).size });
              }
            };
            if (fs.existsSync(dir)) walk(dir, dir);
            return json(res, { ok: true, id, files: list });
          }
          const f = path.resolve(dir, rel);
          if (!f.startsWith(dir + path.sep)) return json(res, { ok: false, error: '路径越界' }, 403);
          if (!fs.existsSync(f)) return json(res, { ok: false, error: '文件不存在' }, 404);
          const body = await fsp.readFile(f, 'utf8');
          return json(res, { ok: true, id, file: rel, text: body.slice(0, 160000) });
        }
        if (p === '/mv-hub/api/frames') {
          const id = u.searchParams.get('id');
          const dir = path.join(ROOT, 'ref', 'frames', id);
          if (!fs.existsSync(dir)) return json(res, { ok: true, id, frames: [] });
          const frames = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg)$/i.test(f)).sort()
            .map((f) => ({ file: f, url: '/mv-hub/frames/' + encodeURIComponent(id) + '/' + encodeURIComponent(f), path: path.join(dir, f) }));
          return json(res, { ok: true, id, frames });
        }
        if (p.startsWith('/mv-hub/frames/')) {
          const rel = safeRel(p.slice('/mv-hub/frames/'.length));
          if (!rel) return text(res, 403, '403');
          return serveFile(req, res, path.join(ROOT, 'ref', 'frames', rel));
        }
        if (p.startsWith('/mv-hub/site/')) {
          const rel = safeRel(p.slice('/mv-hub/site/'.length));
          if (!rel) return text(res, 403, '403');
          const f = path.join(SITE, rel);
          return serveSite(req, res, f.endsWith('/') ? path.join(f, 'index.html') : f);
        }
        if (p === '/mv-hub/site') { res.writeHead(302, { Location: '/mv-hub/site/index.html' }); return res.end(); }
        return text(res, 404, '404');
      } catch (e) {
        try { text(res, 500, '500 ' + e.message); } catch (_) {}
      }
    },
  }), 'mv-hub-routes');

  /* ---------- /custom/<pkg>（下载好的合集包，路径和软件版一致） ---------- */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/custom',
    handler: (req, res) => {
      try {
        const u = new URL(req.url, 'http://127.0.0.1');
        const p = decodeURIComponent(u.pathname);
        const rest = p.slice('/custom/'.length).split('/');
        const pkg = rest.shift();
        if (!pkg || !/^[a-z0-9._-]+$/i.test(pkg) || !CATALOG.packages[pkg]) return text(res, 404, '404');
        const base = path.resolve(pkgsDir, pkg);
        const rel = rest.join('/') || 'index.html';
        const f = path.resolve(base, rel);
        if (f !== base && !f.startsWith(base + path.sep)) return text(res, 403, '403');
        if (!fs.existsSync(f)) return text(res, 404, '404');
        return serveFile(req, res, f);
      } catch (e) { text(res, 500, '500 ' + e.message); }
    },
  }), 'mv-custom-routes');

  /* ---------- DSH 工具 ---------- */
  const tool = (name, description, properties, required, fn) => ctx.tools.register({
    name,
    description,
    parameters: { type: 'object', properties, required, additionalProperties: false },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    execute: async (args) => String(await fn(args)),
  });

  ctx.effect(() => tool(
    'mv_hub_catalog',
    '列出 MV 合集：默认 MV、各合集包（大小/是否已下载）、13 支 MV 的标题、时长与源码目录。做 MV 前先调它。',
    {}, [],
    () => {
      const ins = installed();
      const lines = [`MV渲染器 ${CATALOG.version}（默认 MV：P(doom)，本地内置）`];
      for (const [id, P] of Object.entries(CATALOG.packages)) {
        lines.push(`合集包 ${id}「${P.title}」 ${(P.bytes / 1e6).toFixed(0)} MB — ${ins[id] ? '已下载' : '未下载（可调 mv_hub_download）'}`);
      }
      lines.push('MV：');
      for (const m of CATALOG.mvs) {
        lines.push(`- ${m.id} ${m.title} ${m.dur}${m.pkg ? ` [包 ${m.pkg}${ins[m.pkg] ? ' 已下载' : ''}]` : ' [内置默认]'} 源码 ref/code/${m.id}`);
      }
      lines.push('接口：mv_hub_source(id,file?) 读源码；mv_hub_frames(id) 拿画面帧路径；mv_hub_download(pkg) 下载合集包。');
      return lines.join('\n');
    },
  ), 'mv-tool-catalog');

  ctx.effect(() => tool(
    'mv_hub_source',
    '读某一支 MV 的源码。不传 file 时列出文件；传 file（相对路径）返回源码文本。用于参考镜头的写法、mvkit 用法与时间轴。',
    {
      id: { type: 'string', description: 'MV id，例如 world2 / flip2 / math / deepseek' },
      file: { type: 'string', description: '可选，相对路径，例如 src/main.js' },
    }, ['id'],
    async ({ id, file }) => {
      const dir = path.join(ROOT, 'ref', 'code', id);
      if (!fs.existsSync(dir)) return `没有 ${id} 的源码目录。先 mv_hub_catalog 看可用 id。`;
      if (!file) {
        const list = [];
        const walk = (d, base) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const f = path.join(d, e.name);
            if (e.isDirectory()) walk(f, base);
            else list.push(`${path.relative(base, f).replace(/\\/g, '/')}  ${fs.statSync(f).size} B`);
          }
        };
        walk(dir, dir);
        return `${id} 源码文件（${list.length}）：\n` + list.join('\n');
      }
      const f = path.resolve(dir, file);
      if (!f.startsWith(dir + path.sep) || !fs.existsSync(f)) return '文件不存在或路径越界。';
      const body = await fsp.readFile(f, 'utf8');
      return body.length > 140000 ? body.slice(0, 140000) + '\n…（截断）' : body;
    },
  ), 'mv-tool-source');

  ctx.effect(() => tool(
    'mv_hub_frames',
    '拿某一支 MV 的参考画面帧（本地绝对路径）。用 read_image 打开这些路径看画面。注意：只有世界还在写三支重绘版有 6 帧逐段时间，其余是封面帧。',
    { id: { type: 'string', description: 'MV id' } }, ['id'],
    ({ id }) => {
      const dir = path.join(ROOT, 'ref', 'frames', id);
      if (!fs.existsSync(dir)) return `没有 ${id} 的参考帧。`;
      const files = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f)).sort();
      return `${id} 参考帧 ${files.length} 张：\n` + files.map((f) => path.join(dir, f)).join('\n');
    },
  ), 'mv-tool-frames');

  ctx.effect(() => tool(
    'mv_hub_download',
    '下载一个合集包（Cloudflare R2）到本机，供插件页面离线播放。包比较大（4 MB ~ 229 MB），只在用户确实要时调用；返回进度状态。',
    { pkg: { type: 'string', description: '合集包 id：ai / science / letters / execute' } }, ['pkg'],
    ({ pkg }) => {
      const P = CATALOG.packages[pkg];
      if (!P) return `没有合集包 ${pkg}。`;
      dl.startDownload({ pkg, url: P.url, sha256: P.sha256, size: P.bytes, mvRoot: pkgsDir });
      return `已开始下载「${P.title}」（${(P.bytes / 1e6).toFixed(0)} MB），进度见 mv_hub_catalog 或插件页面。`;
    },
  ), 'mv-tool-download');
}
