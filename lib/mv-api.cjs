'use strict';
/* MV 合集 · HTTP 路由（无第三方依赖）
 *
 * 只负责把请求落到 store 上；index.js 负责注册路由、定义工具。
 * 路由一览见 /mv-hub/api/help（运行时自描述，外部 agent 也读它）。
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4',
  '.wav': 'audio/wav', '.flac': 'audio/flac', '.ogg': 'audio/ogg', '.opus': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
};
const mime = (p) => MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';

const ROOT_SCRIPTS = ['mv-return.js', 'mv-quality.js', 'mv-start.js', 'mv-progress.js', 'rec-ui.js', 'pdoom-perf.js'];
const SITE_PREFIXES = ['/assets/', '/audio/', '/data/', '/covers/', '/fonts/', '/pdoom-perf.js', '/rec-ui.js', '/mv-return.js', '/mv-start.js', '/mv-quality.js', '/mv-progress.js'];

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
function safeRel(rel) {
  const p = path.resolve('/', rel).slice(1);
  if (!p || p.split('/').some((s) => s === '..')) return null;
  return p;
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

/** 文本文件里把根路径的资源换成站点前缀（内置默认 MV 的页面靠它）。 */
function serveSite(req, res, file, SITE) {
  const ext = path.extname(file).toLowerCase();
  const texty = ['.html', '.js', '.mjs', '.css', '.svg'].includes(ext);
  if (!texty) return serveFile(req, res, file);
  fs.readFile(file, 'utf8', (err, body) => {
    if (err) return text(res, 404, '404');
    let out = body;
    for (const pre of SITE_PREFIXES) out = out.split('"' + pre).join('"/mv-hub/site' + pre).split("'" + pre).join("'/mv-hub/site" + pre);
    sendTextFile(res, file, out);
  });
}

/** 导入的用户 MV 用相对路径；只把共享播放脚本的根路径换到站点前缀。 */
function serveCustom(req, res, file) {
  const ext = path.extname(file).toLowerCase();
  const texty = ['.html', '.js', '.mjs'].includes(ext);
  if (!texty) return serveFile(req, res, file);
  fs.readFile(file, 'utf8', (err, body) => {
    if (err) return text(res, 404, '404');
    let out = body;
    for (const name of ROOT_SCRIPTS) {
      out = out.split('"/' + name).join('"/mv-hub/site/' + name).split("'/" + name).join("'/mv-hub/site/" + name);
    }
    sendTextFile(res, file, out);
  });
}
function sendTextFile(res, file, out) {
  const b = Buffer.from(out, 'utf8');
  res.writeHead(200, { 'Content-Type': mime(file), 'Content-Length': b.length, 'Cache-Control': 'no-cache' });
  res.end(b);
}

function readBody(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let n = 0;
    req.on('data', (c) => {
      n += c.length;
      if (n > max) { reject(Object.assign(new Error('上传内容太大'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** 把请求体直接落盘（zip 上传走这里，不占内存）。 */
function saveBody(req, file, max) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(file);
    let n = 0, failed = false;
    const fail = (e) => {
      if (failed) return;
      failed = true;
      try { ws.destroy(); } catch (_) {}
      fsp.rm(file, { force: true }).catch(() => {});
      reject(e);
    };
    req.on('data', (c) => {
      n += c.length;
      if (n > max) { fail(Object.assign(new Error('上传内容太大'), { status: 413 })); req.destroy(); }
    });
    req.on('error', fail);
    ws.on('error', fail);
    ws.on('finish', () => { if (!failed) resolve(n); });
    req.pipe(ws);
  });
}

async function readJson(req, max) {
  const raw = await readBody(req, max);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString('utf8')); }
  catch (_) { throw Object.assign(new Error('请求体不是合法 JSON'), { status: 400 }); }
}

function pickString(v, max) {
  return typeof v === 'string' ? v.slice(0, max || 2000) : '';
}

function dataUrl(s) {
  if (typeof s !== 'string') return null;
  const m = /^data:([^;,]+)?;base64,(.+)$/s.exec(s);
  if (!m) return null;
  return { type: m[1] || 'application/octet-stream', base64: m[2] };
}

function createApi({ root, dataDir, pkgsDir, catalog, dl, store }) {
  const SITE = path.join(root, 'web');
  const MAX_UPLOAD = 3 * 1024 * 1024 * 1024;
  const MAX_JSON = 256 * 1024 * 1024;

  const installed = () => {
    const out = {};
    for (const p of Object.keys(catalog.packages || {})) {
      out[p] = fs.existsSync(path.join(pkgsDir, p, 'pkg.json'));
    }
    return out;
  };

  function catalogPayload() {
    return {
      ...catalog,
      installed: installed(),
      library: store.library(),
      collections: store.resolveCollections(),
    };
  }

  function helpPayload(base) {
    const b = base || '';
    return {
      product: catalog.product || 'MV渲染器',
      version: catalog.version,
      storage: { dataDir, user: store.userDir },
      interfaces: {
        catalog: { method: 'GET', path: '/mv-hub/api/catalog', note: '合集、内置 MV、我的 MV（library 字段）' },
        source: { method: 'GET', path: '/mv-hub/api/source?id=<key>&file=<相对路径>', note: '读某支 MV 的源码；用户 MV 用 id=u:<id> 或 key=u:<id>' },
        frames: { method: 'GET', path: '/mv-hub/api/frames?id=<key>', note: '参考画面帧；用户 MV 用 u:<id>' },
        collectionSave: { method: 'POST', path: '/mv-hub/api/collection/save', body: { id: '可选，改已有合集', title: '合集名', desc: '简介' } },
        collectionDelete: { method: 'POST', path: '/mv-hub/api/collection/delete', body: { id: '合集 id' } },
        collectionItems: { method: 'POST', path: '/mv-hub/api/collection/items', body: { id: '合集 id', add: ['pdoom', 'u:xxx'], remove: ['u:yyy'] } },
        importZip: { method: 'POST', path: '/mv-hub/api/import?name=<文件名>&title=<标题>&collection=<合集id>', body: 'zip 二进制（Content-Type: application/zip），入口需为 index.html' },
        publish: {
          method: 'POST', path: '/mv-hub/api/publish',
          body: {
            collection: { id: '可选', title: '合集名', desc: '简介' },
            mv: { id: '可选，小写英文 id', title: '标题', sub: '副标题', en: '英文名', desc: '简介', dur: '3:12', entry: 'index.html' },
            files: [{ path: 'index.html', text: '…' }, { path: 'a.png', base64: '…' }],
            cover: { path: 'cover.jpg', base64: '…' },
            frames: [{ path: 'frames/f01.jpg', base64: '…' }],
          },
          note: '直接输出到插件；发布后出现在页面「我的合集 / 全部作品」，可播放、可导出源码与画面帧。cover / frames 也接受 data:image/...;base64 字符串。',
        },
        deleteMv: { method: 'POST', path: '/mv-hub/api/mv/delete', body: { id: '用户 MV id' } },
        play: { method: 'GET', path: '/custom/<key>/<entry>', note: '内置包用 /custom/<pkg>/…；用户 MV 用 /custom/<id>/…' },
      },
      tools: ['mv_hub_catalog', 'mv_hub_source', 'mv_hub_frames', 'mv_hub_download', 'mv_hub_publish', 'mv_hub_import', 'mv_hub_collections'],
      example: `curl -s ${b}/mv-hub/api/publish -H 'Content-Type: application/json' -d '{"collection":{"title":"我的作品"},"mv":{"id":"river","title":"河"},"files":[{"path":"index.html","text":"<canvas></canvas>"}]}'`,
    };
  }

  function serveRootScript(name) {
    return (req, res) => {
      if (!ROOT_SCRIPTS.includes(name)) return text(res, 404, '404');
      serveFile(req, res, path.join(SITE, name));
    };
  }

  /* ---------------- 路由 ---------------- */
  async function handle(req, res) {
    let u;
    try { u = new URL(req.url, 'http://127.0.0.1'); }
    catch (e) { return text(res, 400, '400'); }
    const p = decodeURIComponent(u.pathname);
    const q = u.searchParams;

    try {
      /* ---- API ---- */
      if (p === '/mv-hub/api/catalog') return json(res, catalogPayload());
      if (p === '/mv-hub/api/installed') return json(res, installed());
      if (p === '/mv-hub/api/help') return json(res, helpPayload(''));
      if (p === '/mv-hub/api/export/help') return json(res, helpPayload(''));
      if (p === '/mv-hub/api/dl' && req.method === 'POST') {
        const pkg = q.get('pkg');
        const P = (catalog.packages || {})[pkg];
        if (!P) return json(res, { ok: false, error: '没有这个合集包' }, 404);
        try {
          dl.startDownload({ pkg, url: P.url, sha256: P.sha256, size: P.bytes, mvRoot: pkgsDir });
          return json(res, { ok: true });
        } catch (e) { return json(res, { ok: false, error: e.message }, 400); }
      }
      if (p === '/mv-hub/api/dl/status') return json(res, dl.status(q.get('id')));
      if (p === '/mv-hub/api/dl/cancel') return json(res, { ok: dl.cancel(q.get('id')) });

      if (p === '/mv-hub/api/source') {
        const key = q.get('key') || q.get('id');
        const rel = q.get('file');
        const dir = store.sourceDir(key && key.startsWith('u:') ? key.slice(2) : key, key);
        if (!dir) return json(res, { ok: false, error: '没有这支 MV 的源码' }, 404);
        if (!rel) {
          const list = [];
          const walk = (d, base) => {
            for (const e of fs.readdirSync(d, { withFileTypes: true })) {
              const f = path.join(d, e.name);
              if (e.isDirectory()) walk(f, base);
              else if (e.name !== 'meta.json') list.push({ file: path.relative(base, f).replace(/\\/g, '/'), bytes: fs.statSync(f).size });
            }
          };
          walk(dir, dir);
          return json(res, { ok: true, id: key, files: list });
        }
        const f = path.resolve(dir, rel);
        if (!f.startsWith(dir + path.sep)) return json(res, { ok: false, error: '路径越界' }, 403);
        if (!fs.existsSync(f)) return json(res, { ok: false, error: '文件不存在' }, 404);
        const body = await fsp.readFile(f, 'utf8');
        return json(res, { ok: true, id: key, file: rel, text: body.slice(0, 160000) });
      }

      if (p === '/mv-hub/api/frames') {
        const key = q.get('key') || q.get('id');
        const id = key && key.startsWith('u:') ? key.slice(2) : key;
        const dir = store.framesDir(id, key);
        if (!dir || !fs.existsSync(dir)) return json(res, { ok: true, id: key, frames: [] });
        const meta = store.readMeta(id);
        const frames = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpe?g|gif)$/i.test(f)).sort().map((f) => ({
          file: f,
          url: meta ? '/custom/' + id + '/frames/' + encodeURIComponent(f) : '/mv-hub/frames/' + encodeURIComponent(id) + '/' + encodeURIComponent(f),
          path: path.join(dir, f),
        }));
        return json(res, { ok: true, id: key, frames });
      }

      if (p === '/mv-hub/api/collection/save' && req.method === 'POST') {
        const body = await readJson(req, 1024 * 1024);
        const title = pickString(body.title, 80);
        if (!title) return json(res, { ok: false, error: '合集名不能为空' }, 400);
        const col = body.id ? store.updateCollection({ id: body.id, title, desc: body.desc }) : store.createCollection({ title, desc: body.desc });
        return json(res, { ok: true, collection: col });
      }
      if (p === '/mv-hub/api/collection/delete' && req.method === 'POST') {
        const body = await readJson(req, 1024 * 1024);
        store.deleteCollection(body.id);
        return json(res, { ok: true });
      }
      if (p === '/mv-hub/api/collection/items' && req.method === 'POST') {
        const body = await readJson(req, 4 * 1024 * 1024);
        let col = null;
        if (Array.isArray(body.add) && body.add.length) col = store.addItems(body.id, body.add);
        if (Array.isArray(body.remove) && body.remove.length) col = store.removeItems(body.id, body.remove);
        return json(res, { ok: true, collection: col });
      }

      if (p === '/mv-hub/api/import' && req.method === 'POST') {
        const name = pickString(q.get('name') || q.get('filename'), 200);
        const title = pickString(q.get('title'), 80);
        const collection = pickString(q.get('collection'), 64);
        const id = pickString(q.get('id'), 64);
        const tmp = path.join(store.userDir, '.upload-' + crypto.randomBytes(6).toString('hex') + '.zip');
        await fsp.mkdir(store.userDir, { recursive: true });
        let n = 0;
        try {
          n = await saveBody(req, tmp, MAX_UPLOAD);
          if (n < 22) return json(res, { ok: false, error: '上传内容不是 zip' }, 400);
          const out = await store.importZip(tmp, {
            id: id || (name || '').replace(/\.zip$/i, ''),
            title: title || (name || '').replace(/\.zip$/i, ''),
            collection: collection && store.loadCollections().some((c) => c.id === collection) ? collection : null,
          });
          return json(res, { ok: true, id: out.id, title: out.meta.title, url: out.url });
        } catch (e) {
          return json(res, { ok: false, error: e.message || String(e) }, 400);
        } finally {
          fsp.rm(tmp, { force: true }).catch(() => {});
        }
      }

      if (p === '/mv-hub/api/publish' && req.method === 'POST') {
        const body = await readJson(req, MAX_JSON);
        if (!body.mv || !body.mv.title) return json(res, { ok: false, error: 'mv.title 不能为空' }, 400);
        const files = Array.isArray(body.files) ? body.files : [];
        if (!files.length) return json(res, { ok: false, error: 'files 不能为空（至少要有 index.html）' }, 400);
        const frames = [];
        for (const fr of Array.isArray(body.frames) ? body.frames : []) {
          if (typeof fr === 'string') {
            const d = dataUrl(fr);
            if (d) frames.push({ base64: d.base64, path: '' });
          } else if (fr && fr.base64) frames.push({ base64: fr.base64, path: fr.path || '' });
        }
        let cover = null;
        if (typeof body.cover === 'string') {
          const d = dataUrl(body.cover);
          if (d) cover = { base64: d.base64, path: 'cover' + (d.type && d.type.includes('png') ? '.png' : '.jpg') };
        } else if (body.cover && body.cover.base64) {
          cover = { base64: body.cover.base64, path: body.cover.path || 'cover.jpg' };
        }
        const out = await store.publish({
          collection: body.collection || null,
          mv: body.mv,
          files,
          cover,
          frames,
        });
        return json(res, { ok: true, id: out.id, title: out.meta.title, url: out.url, key: 'u:' + out.id, collection: out.meta.collection || null });
      }

      if (p === '/mv-hub/api/mv/delete' && req.method === 'POST') {
        const body = await readJson(req, 1024 * 1024);
        await store.deleteMv(body.id);
        return json(res, { ok: true });
      }

      /* ---- 展示：站点 / 画面帧 / 下载包 / 用户 MV ---- */
      if (p === '/mv-hub/site') { res.writeHead(302, { Location: '/mv-hub/site/index.html' }); return res.end(); }
      if (p.startsWith('/mv-hub/site/')) {
        const rel = safeRel(p.slice('/mv-hub/site/'.length));
        if (!rel) return text(res, 403, '403');
        const f = path.join(SITE, rel);
        return serveSite(req, res, f.endsWith('/') ? path.join(f, 'index.html') : f, SITE);
      }
      if (p.startsWith('/mv-hub/frames/')) {
        const rel = safeRel(p.slice('/mv-hub/frames/'.length));
        if (!rel) return text(res, 403, '403');
        return serveFile(req, res, path.join(root, 'ref', 'frames', rel));
      }

      if (p.startsWith('/custom/')) {
        const rel = safeRel(p.slice('/custom/'.length));
        if (!rel) return text(res, 403, '403');
        const [key, ...rest] = rel.split('/');
        const sub = rest.join('/') || 'index.html';
        if ((catalog.packages || {})[key]) {
          const base = path.resolve(pkgsDir, key);
          const f = path.resolve(base, sub);
          if (f !== base && !f.startsWith(base + path.sep)) return text(res, 403, '403');
          if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return text(res, 404, '404');
          return serveFile(req, res, f);
        }
        const base = store.userMount(key);
        if (!base || !store.readMeta(key)) return text(res, 404, '404');
        const f = path.resolve(base, sub);
        if (!f.startsWith(base + path.sep)) return text(res, 403, '403');
        if (!fs.existsSync(f)) return text(res, 404, '404');
        if (fs.statSync(f).isDirectory()) return serveCustom(req, res, path.join(f, 'index.html'));
        return serveCustom(req, res, f);
      }

      return text(res, 404, '404');
    } catch (e) {
      const code = e && e.status ? e.status : 500;
      try { json(res, { ok: false, error: (e && e.message) || String(e) }, code); } catch (_) {}
    }
  }

  return { handle, serveRootScript, catalogPayload, installed };
}

module.exports = { createApi, ROOT_SCRIPTS, MIME };
