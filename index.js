/**
 * MV 合集 · DSH Host 插件
 * - 内置默认 MV（P(doom)）挂在 /mv-hub/site/，页面用 React 渲染，播放时内嵌这层画面。
 * - 合集包按需从 Cloudflare R2 下载到 dataDir/pkgs/<pkg>，挂到 /custom/<pkg>/。
 * - 用户自己创建 / 导入 / 由 DSH 发布的 MV 放在 dataDir/user/，挂到 /custom/<id>/。
 * - 工具：列表 / 源码 / 画面帧 / 下载 / 发布 / 导入 / 合集管理。
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const dl = require('./lib/mv-dl.cjs');
const { createStore } = require('./lib/mv-store.cjs');
const { createApi, ROOT_SCRIPTS } = require('./lib/mv-api.cjs');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));

export const inject = ['tools', 'webServer'];

export function apply(ctx) {
  const dataDir = process.env.MV_HUB_DIR || path.join(process.env.DSH_HOME || '/root/.dsh', 'mv-hub');
  const pkgsDir = path.join(dataDir, 'pkgs');
  fs.mkdirSync(pkgsDir, { recursive: true });

  const store = createStore({ dataDir, root: ROOT, catalog: CATALOG });
  const api = createApi({ root: ROOT, dataDir, pkgsDir, catalog: CATALOG, dl, store });

  /* ---------- /mv-hub ---------- */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/mv-hub',
    handler: api.handle,
  }), 'mv-hub-routes');

  /* ---------- /custom/<pkg | mv> ---------- */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/custom',
    handler: api.handle,
  }), 'mv-custom-routes');

  /* ---------- 共享播放脚本（导入的 MV 用根路径引用它们） ---------- */
  for (const name of ROOT_SCRIPTS) {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/' + name,
      handler: api.serveRootScript(name),
    }), 'mv-root-' + name);
  }

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

  const countAll = () => {
    const lib = store.library();
    const cols = store.resolveCollections();
    return { lib, cols };
  };

  ctx.effect(() => tool(
    'mv_hub_catalog',
    '列出 MV 合集与作品：内置 13 支 MV、合集包（大小/是否已下载）、用户合集、导入/发布的 MV。做 MV 前先调它。',
    {}, [],
    () => {
      const ins = api.installed();
      const { lib, cols } = countAll();
      const lines = [`MV渲染器 ${CATALOG.version}（默认 MV：P(doom)，本地内置）`];
      for (const [id, P] of Object.entries(CATALOG.packages)) {
        lines.push(`合集包 ${id}「${P.title}」 ${(P.bytes / 1e6).toFixed(0)} MB — ${ins[id] ? '已下载' : '未下载（可调 mv_hub_download）'}`);
      }
      lines.push('内置 MV：');
      for (const m of CATALOG.mvs) {
        lines.push(`- ${m.id} ${m.title} ${m.dur}${m.pkg ? ` [包 ${m.pkg}${ins[m.pkg] ? ' 已下载' : ''}]` : ' [内置默认]'} 源码 ref/code/${m.id}`);
      }
      lines.push(`用户合集（${cols.length}）：`);
      if (!cols.length) lines.push('- 还没有。可以用 mv_hub_collections 新建，或发布时带 collection。');
      for (const c of cols) {
        const names = c.items.map((i) => i.title).join(' / ');
        lines.push(`- ${c.id}「${c.title}」 ${c.count} 支${names ? '：' + names : ''}`);
      }
      lines.push(`我的 MV（导入 / 发布，${lib.length}）：`);
      if (!lib.length) lines.push('- 还没有。mv_hub_import(zip) 或 mv_hub_publish(dir/files) 会放进来。');
      for (const m of lib) lines.push(`- u:${m.id} ${m.title} ${m.dur || ''} 源码 u:${m.id} 播放 /custom/${m.id}/${m.entry}`);
      lines.push('接口：mv_hub_source(id,file?) 读源码（用户 MV 用 u:<id>）；mv_hub_frames(id) 拿画面帧；mv_hub_download(pkg) 下载合集包；mv_hub_publish 直接发布到插件；mv_hub_import 导入 zip；mv_hub_collections 管理合集。');
      return lines.join('\n');
    },
  ), 'mv-tool-catalog');

  ctx.effect(() => tool(
    'mv_hub_source',
    '读某一支 MV 的源码。不传 file 时列出文件；传 file（相对路径）返回源码文本。内置 MV 用 id（如 world2）；导入/发布的用 u:<id>。',
    {
      id: { type: 'string', description: 'MV id，例如 world2 / math / u:k3f9a1' },
      file: { type: 'string', description: '可选，相对路径，例如 src/main.js' },
    }, ['id'],
    async ({ id, file }) => {
      const key = String(id || '');
      const dir = store.sourceDir(key.startsWith('u:') ? key.slice(2) : key, key);
      if (!dir) return `没有 ${id} 的源码目录。先 mv_hub_catalog 看可用 id。`;
      if (!file) {
        const list = [];
        const walk = (d, base) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const f = path.join(d, e.name);
            if (e.isDirectory()) walk(f, base);
            else if (e.name !== 'meta.json') list.push(`${path.relative(base, f).replace(/\\/g, '/')}  ${fs.statSync(f).size} B`);
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
    '拿某一支 MV 的参考画面帧（本地绝对路径）。用 read_image 打开这些路径看画面。内置 MV 用 id；导入/发布的用 u:<id>（发布时带 frames 才有）。',
    { id: { type: 'string', description: 'MV id（u:<id> 也行）' } }, ['id'],
    ({ id }) => {
      const key = String(id || '');
      const dir = store.framesDir(key.startsWith('u:') ? key.slice(2) : key, key);
      if (!dir || !fs.existsSync(dir)) return `没有 ${id} 的参考帧。`;
      const files = fs.readdirSync(dir).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f)).sort();
      if (!files.length) return `${id} 没有参考帧。`;
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

  ctx.effect(() => tool(
    'mv_hub_publish',
    '把做好的 MV 直接发布到插件里（用户马上能在 MV 合集页面看到并播放）。优先用 dir 指向构建好的目录（里面要有 index.html）；也可以逐文件给 files。可以顺带指定合集、封面和画面帧。返回播放地址与源码 key（u:<id>）。',
    {
      title: { type: 'string', description: 'MV 标题（必填）' },
      id: { type: 'string', description: '可选 id（小写英文/数字），不填自动生成' },
      sub: { type: 'string', description: '副标题，如「大肥鱼的角色主题曲」' },
      en: { type: 'string', description: '英文名' },
      desc: { type: 'string', description: '一两句简介' },
      dur: { type: 'string', description: '时长，如 3:24' },
      entry: { type: 'string', description: '入口页，默认 index.html' },
      dir: { type: 'string', description: '构建好的 MV 目录（绝对路径或相对工作区）；复制整棵目录' },
      files: {
        type: 'array', description: '逐文件发布（dir 为空时用）',
        items: {
          type: 'object',
          properties: { path: { type: 'string' }, text: { type: 'string' }, base64: { type: 'string' } },
          required: ['path'], additionalProperties: false,
        },
      },
      cover: { type: 'string', description: '封面图绝对路径（可选）' },
      frames: { type: 'array', items: { type: 'string' }, description: '参考画面帧图片绝对路径（可选，第一张会当封面）' },
      framesDir: { type: 'string', description: '参考帧目录（可选）' },
      collection: { type: 'string', description: '合集 id 或合集名；不存在就新建（可选）' },
      collectionDesc: { type: 'string', description: '新建合集时的简介（可选）' },
    }, ['title'],
    async (a) => {
      let files = Array.isArray(a.files) ? a.files : [];
      let frames = Array.isArray(a.frames) ? a.frames.filter(Boolean) : [];
      if (a.framesDir) {
        try {
          frames = frames.concat(fs.readdirSync(a.framesDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => path.join(a.framesDir, f)));
        } catch (_) {}
      }
      if (frames.length > 12) frames = frames.slice(0, 12);
      const out = await store.publish({
        collection: a.collection ? { id: a.collection, title: safeName(a.collection), desc: a.collectionDesc } : null,
        mv: { id: a.id, title: a.title, sub: a.sub, en: a.en, desc: a.desc, dur: a.dur, entry: a.entry },
        files,
        cover: a.cover || null,
        frames,
        srcDir: a.dir || null,
      });
      return [
        `已发布「${out.meta.title}」到插件：`,
        `- 播放：/custom/${out.id}/${out.meta.entry}`,
        `- 源码 key：u:${out.id}（mv_hub_source id=u:${out.id}）`,
        `- 画面帧：${out.meta.frames && out.meta.frames.length ? out.meta.frames.length + ' 张' : '没有（下次带 frames 或 framesDir）'}`,
        out.meta.collection ? `- 合集：${out.meta.collection}` : '- 未归入合集（可在插件页面里收进合集）',
        '用户在「MV 合集」页面刷新就能看到。',
      ].join('\n');
    },
  ), 'mv-tool-publish');

  ctx.effect(() => tool(
    'mv_hub_import',
    '把一个 zip 导入插件（构建好的 MV 项目，入口为 index.html）。导入后用户能在页面里看到并播放，也可归入某个合集。',
    {
      zip: { type: 'string', description: 'zip 绝对路径' },
      title: { type: 'string', description: '标题（可选，默认取文件名）' },
      collection: { type: 'string', description: '合集 id 或合集名（可选）' },
    }, ['zip'],
    async ({ zip, title, collection }) => {
      const p = path.resolve(String(zip || ''));
      const st = fs.existsSync(p) ? fs.statSync(p) : null;
      if (!st || !st.isFile()) return `找不到 zip：${zip}`;
      const out = await store.importZip(p, {
        title: title || path.basename(p).replace(/\.zip$/i, ''),
        collection: collection ? store.ensureCollection({ id: collection, title: safeName(collection) }).id : null,
      });
      return `已导入「${out.meta.title}」：播放 /custom/${out.id}/${out.meta.entry}，源码 key u:${out.id}。`;
    },
  ), 'mv-tool-import');

  ctx.effect(() => tool(
    'mv_hub_collections',
    '管理插件里的用户合集：列出 / 新建 / 改名 / 删除，往合集里加或移出作品（内置 id 如 pdoom、world，用户 MV 用 u:<id>）。',
    {
      action: { type: 'string', enum: ['list', 'create', 'rename', 'delete', 'add', 'remove'], description: '操作' },
      id: { type: 'string', description: '合集 id（create 时可省略）' },
      title: { type: 'string', description: '合集名（create/rename 用）' },
      desc: { type: 'string', description: '合集简介' },
      mvs: { type: 'array', items: { type: 'string' }, description: '要加入/移出的作品 id 或 key' },
    }, ['action'],
    (a) => {
      const action = String(a.action || 'list');
      const mvs = Array.isArray(a.mvs) ? a.mvs.map(String) : [];
      if (action === 'list') {
        const cols = store.resolveCollections();
        if (!cols.length) return '还没有用户合集。';
        return cols.map((c) => `${c.id}「${c.title}」${c.desc ? ' — ' + c.desc : ''}\n  ${c.count} 支：${c.items.map((i) => i.key + ' ' + i.title).join(' / ')}`).join('\n');
      }
      if (action === 'create') {
        const col = store.createCollection({ id: a.id, title: a.title, desc: a.desc });
        if (mvs.length) store.addItems(col.id, mvs);
        return `已新建合集 ${col.id}「${col.title}」${mvs.length ? '，加入 ' + mvs.length + ' 支作品' : ''}。`;
      }
      if (action === 'rename') {
        const col = store.updateCollection({ id: a.id, title: a.title, desc: a.desc });
        return `已更新合集 ${col.id}「${col.title}」。`;
      }
      if (action === 'delete') {
        store.deleteCollection(a.id);
        return `已删除合集 ${a.id}（里面的 MV 文件保留）。`;
      }
      if (action === 'add' || action === 'remove') {
        if (!mvs.length) return 'mvs 不能为空。';
        const col = action === 'add' ? store.addItems(a.id, mvs) : store.removeItems(a.id, mvs);
        return `合集 ${col.id}「${col.title}」现在 ${col.items.length} 支。`;
      }
      return '未知操作：' + action;
    },
  ), 'mv-tool-collections');
}

function safeName(s) {
  if (typeof s !== 'string' || !s) return '未命名合集';
  if (/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(s)) return s;
  return s.slice(0, 80);
}
