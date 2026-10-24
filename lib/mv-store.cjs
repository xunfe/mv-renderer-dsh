'use strict';
/* MV 合集 · 用户内容存储（无第三方依赖）
 *
 * 目录（dataDir 默认 $DSH_HOME/mv-hub）：
 *   user/collections.json      [{ id, title, desc, createdAt, items: [key] }]
 *   user/mvs/<id>/            导入 / 发布进来的 MV（index.html + 资源）
 *   user/mvs/<id>/meta.json   元数据
 *   user/mvs/<id>/frames/     参考画面帧
 *
 * key：内置 MV 用 catalog 里的 id（如 pdoom / world）；用户 MV 用 "u:<id>"。
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { unzip } = require('./mv-dl.cjs');

const IMG = /\.(png|jpe?g|webp|gif)$/i;
const TMP = /^\.(upload|unzip|tmp)-/;

function safeId(s) {
  return typeof s === 'string' && /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(s);
}
function safeRel(p) {
  if (typeof p !== 'string' || !p) return null;
  const norm = p.replace(/\\/g, '/').replace(/^\/+/, '');
  if (norm.split('/').some((s) => s === '..' || s === '')) return null;
  return norm;
}
function genId(prefix) {
  return (prefix || 'mv') + Date.now().toString(36) + crypto.randomBytes(2).toString('hex');
}
function rid(n) {
  return crypto.randomBytes(n).toString('hex');
}

function createStore({ dataDir, root, catalog }) {
  const userDir = path.join(dataDir, 'user');
  const mvsDir = path.join(userDir, 'mvs');
  const collFile = path.join(userDir, 'collections.json');
  fs.mkdirSync(mvsDir, { recursive: true });

  /* ---------------- 合集 ---------------- */
  function loadCollections() {
    try {
      const list = JSON.parse(fs.readFileSync(collFile, 'utf8'));
      return Array.isArray(list) ? list.filter((c) => c && safeId(c.id)) : [];
    } catch (_) { return []; }
  }
  function saveCollections(list) {
    fs.mkdirSync(userDir, { recursive: true });
    const tmp = collFile + '.' + rid(4) + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmp, collFile);
  }

  function uniqueCollId(want) {
    const list = loadCollections();
    let base = safeId(want) ? want : genId('c');
    let id = base, n = 2;
    while (list.some((c) => c.id === id)) id = base + '-' + n++;
    return id;
  }

  function createCollection({ id, title, desc } = {}) {
    const list = loadCollections();
    const cid = id && safeId(id) && !list.some((c) => c.id === id) ? id : uniqueCollId(id);
    const col = {
      id: cid,
      title: String(title || '未命名合集').slice(0, 80),
      desc: String(desc || '').slice(0, 300),
      createdAt: Date.now(),
      items: [],
    };
    list.push(col);
    saveCollections(list);
    return col;
  }

  function ensureCollection({ id, title, desc } = {}) {
    const list = loadCollections();
    if (id && safeId(id)) {
      const hit = list.find((c) => c.id === id);
      if (hit) return hit;
    }
    const name = title || (id && !safeId(id) ? String(id) : '');
    if (name) {
      const hit = list.find((c) => c.title === name.slice(0, 80));
      if (hit) return hit;
    }
    return createCollection({ id: id && safeId(id) ? id : undefined, title: name || '未命名合集', desc });
  }

  function updateCollection({ id, title, desc } = {}) {
    if (!safeId(id)) throw new Error('合集 id 不合法');
    const list = loadCollections();
    const col = list.find((c) => c.id === id);
    if (!col) throw new Error('没有这个合集');
    if (title != null) col.title = String(title).slice(0, 80);
    if (desc != null) col.desc = String(desc).slice(0, 300);
    saveCollections(list);
    return col;
  }

  function deleteCollection(id) {
    if (!safeId(id)) throw new Error('合集 id 不合法');
    const list = loadCollections();
    const next = list.filter((c) => c.id !== id);
    if (next.length === list.length) throw new Error('没有这个合集');
    saveCollections(next);
    return true;
  }

  function addItems(id, keys) {
    if (!safeId(id)) throw new Error('合集 id 不合法');
    const list = loadCollections();
    const col = list.find((c) => c.id === id);
    if (!col) throw new Error('没有这个合集');
    for (const k of keys || []) {
      const key = String(k);
      if (!key || col.items.includes(key)) continue;
      col.items.push(key);
    }
    saveCollections(list);
    return col;
  }

  function removeItems(id, keys) {
    if (!safeId(id)) throw new Error('合集 id 不合法');
    const list = loadCollections();
    const col = list.find((c) => c.id === id);
    if (!col) throw new Error('没有这个合集');
    const drop = new Set((keys || []).map(String));
    col.items = col.items.filter((k) => !drop.has(k));
    saveCollections(list);
    return col;
  }

  /* ---------------- 用户 MV ---------------- */
  function metaFile(id) { return path.join(mvsDir, id, 'meta.json'); }

  function readMeta(id) {
    if (!safeId(id)) return null;
    try {
      const m = JSON.parse(fs.readFileSync(metaFile(id), 'utf8'));
      return m && safeId(m.id) ? m : null;
    } catch (_) { return null; }
  }

  function listUserMvs() {
    let names = [];
    try { names = fs.readdirSync(mvsDir); } catch (_) { return []; }
    const out = [];
    for (const n of names) {
      if (!safeId(n) || TMP.test(n)) continue;
      const m = readMeta(n);
      if (m) out.push(m);
    }
    return out.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
  }

  async function dirBytes(dir) {
    let total = 0;
    const walk = async (d) => {
      let es = [];
      try { es = await fsp.readdir(d, { withFileTypes: true }); } catch (_) { return; }
      for (const e of es) {
        const f = path.join(d, e.name);
        if (e.isDirectory()) await walk(f);
        else { try { total += (await fsp.stat(f)).size; } catch (_) {} }
      }
    };
    await walk(dir);
    return total;
  }

  function detectCover(dir) {
    for (const n of ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp', 'poster.jpg', 'poster.png']) {
      try { if (fs.existsSync(path.join(dir, n))) return n; } catch (_) {}
    }
    const fr = path.join(dir, 'frames');
    try {
      const hit = fs.readdirSync(fr).filter((f) => IMG.test(f)).sort()[0];
      if (hit) return 'frames/' + hit;
    } catch (_) {}
    return null;
  }

  function writeMeta(id, meta) {
    fs.writeFileSync(metaFile(id), JSON.stringify(meta, null, 2), 'utf8');
    return meta;
  }

  function resolveEntry(key, opts) {
    opts = opts || {};
    const k = String(key || '');
    if (k.startsWith('u:')) {
      const m = readMeta(k.slice(2));
      if (!m) return null;
      const base = '/custom/' + m.id + '/';
      return {
        key: k, kind: 'user', id: m.id, title: m.title, sub: m.sub || '', en: m.en || '',
        desc: m.desc || '', dur: m.dur || '', entry: m.entry || 'index.html',
        cover: m.cover ? base + m.cover.split('/').map(encodeURIComponent).join('/') : null,
        src: base + (m.entry || 'index.html'), publishedAt: m.publishedAt || 0,
        source: m.source || 'import',
      };
    }
    const m = (catalog.mvs || []).find((x) => x.id === k);
    if (!m) return null;
    const pkg = m.pkg || null;
    return {
      key: m.id, kind: pkg ? 'pkg' : 'builtin', id: m.id, title: m.title, sub: m.sub || '',
      en: m.en || '', desc: m.desc || '', dur: m.dur || '', entry: m.file || null,
      cover: '/mv-hub/site/covers/' + encodeURIComponent(m.cover || 'pdoom.jpg'),
      src: pkg ? '/custom/' + pkg + '/' + m.path : '/mv-hub/site/' + m.file,
      pkg, path: m.path || null,
    };
  }

  function resolveCollections() {
    return loadCollections().map((c) => {
      const items = (c.items || []).map((k) => resolveEntry(k)).filter(Boolean);
      return {
        id: c.id, title: c.title, desc: c.desc || '', createdAt: c.createdAt || 0,
        items, count: items.length, cover: (items.find((i) => i.cover) || {}).cover || null,
      };
    });
  }

  /** 用户 MV 的公开列表（catalog 的 library 字段）。 */
  function library() {
    return listUserMvs().map((m) => resolveEntry('u:' + m.id)).filter(Boolean);
  }

  /* ---------------- 导入 zip ---------------- */
  async function findEntryRoot(dir) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
    const kids = (await fsp.readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory() && !TMP.test(e.name));
    // 单层包裹目录（zip 里套一个项目文件夹）
    for (const k of kids) {
      const sub = path.join(dir, k.name);
      if (fs.existsSync(path.join(sub, 'index.html'))) return sub;
    }
    // 最多两层，第一个带 index.html 的目录
    for (const k of kids) {
      const sub = path.join(dir, k.name);
      let deeper = [];
      try { deeper = await fsp.readdir(sub, { withFileTypes: true }); } catch (_) { continue; }
      for (const d of deeper) {
        if (d.isDirectory() && fs.existsSync(path.join(sub, d.name, 'index.html'))) return path.join(sub, d.name);
      }
    }
    return null;
  }

  async function importZip(zipPath, { id, title, collection, entry } = {}) {
    const st = await fsp.stat(zipPath);
    if (!st.isFile() || st.size < 22) throw new Error('zip 不完整');
    const cid = id && safeId(id) ? id : genId('mv');
    let mid = cid, n = 2;
    while (fs.existsSync(path.join(mvsDir, mid))) mid = cid + '-' + n++;
    const tmp = path.join(userDir, '.unzip-' + mid + '-' + rid(3));
    await fsp.mkdir(tmp, { recursive: true });
    try {
      await unzip(zipPath, tmp);
      const base = await findEntryRoot(tmp);
      if (!base) throw new Error('zip 里找不到 index.html（需要项目构建后的入口页）');
      const dir = path.join(mvsDir, mid);
      try { await fsp.rm(dir, { recursive: true, force: true }); } catch (_) {}
      if (base === tmp) await fsp.rename(tmp, dir);
      else { await fsp.rename(base, dir); await fsp.rm(tmp, { recursive: true, force: true }); }
      const cover = detectCover(dir);
      const meta = {
        id: mid,
        title: String(title || mid).slice(0, 80),
        sub: '导入',
        en: 'IMPORTED MV',
        desc: '从 zip 导入的 MV，画面与内置作品一样在浏览器里实时渲染。',
        dur: '',
        entry: entry && safeRel(entry) && fs.existsSync(path.join(dir, entry)) ? entry : 'index.html',
        cover,
        source: 'import',
        publishedAt: Date.now(),
        bytes: await dirBytes(dir),
      };
      writeMeta(mid, meta);
      if (collection) addItems(collection, ['u:' + mid]);
      return { id: mid, meta, url: '/custom/' + mid + '/' + meta.entry };
    } catch (e) {
      try { await fsp.rm(tmp, { recursive: true, force: true }); } catch (_) {}
      throw e;
    }
  }

  /* ---------------- 发布（DSH / 外部 agent 直接输出到插件） ---------------- */
  async function publish({ collection, mv, files, cover, frames, srcDir } = {}) {
    mv = mv || {};
    const want = mv.id && safeId(mv.id) ? mv.id : genId('mv');
    let mid = want, n = 2;
    while (fs.existsSync(path.join(mvsDir, mid))) mid = want + '-' + n++;
    const dir = path.join(mvsDir, mid);
    await fsp.mkdir(dir, { recursive: true });

    try {
      if (srcDir) {
        const s = await fsp.stat(srcDir).catch(() => null);
        if (!s || !s.isDirectory()) throw new Error('dir 不是有效目录：' + srcDir);
        await fsp.cp(srcDir, dir, { recursive: true });
      }
      for (const f of files || []) {
        const rel = safeRel(f && f.path);
        if (!rel) continue;
        const dst = path.join(dir, rel);
        await fsp.mkdir(path.dirname(dst), { recursive: true });
        if (typeof f.text === 'string') await fsp.writeFile(dst, f.text, 'utf8');
        else if (typeof f.base64 === 'string') await fsp.writeFile(dst, Buffer.from(f.base64, 'base64'));
        else if (typeof f.data === 'string') await fsp.writeFile(dst, Buffer.from(f.data, 'base64'));
      }
      // 封面：可以是 {path,base64}，也可以是绝对路径（工具用）
      let coverRel = null;
      if (cover) {
        if (typeof cover === 'string') {
          const s = await fsp.stat(cover).catch(() => null);
          if (s && s.isFile()) {
            coverRel = 'cover' + (path.extname(cover).toLowerCase() || '.jpg');
            await fsp.copyFile(cover, path.join(dir, coverRel));
          }
        } else if (cover.base64) {
          coverRel = safeRel(cover.path || ('cover' + (path.extname(cover.path || '') || '.jpg')));
          if (coverRel) await fsp.writeFile(path.join(dir, coverRel), Buffer.from(cover.base64, 'base64'));
        }
      }
      // 参考画面帧
      const frameNames = [];
      let i = 0;
      for (const fr of frames || []) {
        i++;
        const name = 'f' + String(i).padStart(2, '0') + '.jpg';
        if (typeof fr === 'string') {
          const s = await fsp.stat(fr).catch(() => null);
          if (!s || !s.isFile()) continue;
          const ext = path.extname(fr).toLowerCase() || '.jpg';
          const out = name.replace(/\.jpg$/, ext);
          await fsp.copyFile(fr, path.join(dir, 'frames', out)).catch(async () => {
            await fsp.mkdir(path.join(dir, 'frames'), { recursive: true });
            await fsp.copyFile(fr, path.join(dir, 'frames', out));
          });
          frameNames.push('frames/' + out);
        } else if (fr && fr.base64) {
          const out = name.replace(/\.jpg$/, path.extname(fr.path || '') || '.jpg');
          await fsp.mkdir(path.join(dir, 'frames'), { recursive: true });
          await fsp.writeFile(path.join(dir, 'frames', out), Buffer.from(fr.base64, 'base64'));
          frameNames.push('frames/' + out);
        }
      }
      const entry = mv.entry && safeRel(mv.entry) ? safeRel(mv.entry) : 'index.html';
      if (!fs.existsSync(path.join(dir, entry))) throw new Error('入口文件不存在：' + entry + '（需要 index.html）');
      const detected = coverRel || detectCover(dir);
      const meta = {
        id: mid,
        title: String(mv.title || mid).slice(0, 80),
        sub: String(mv.sub || 'DSH 发布').slice(0, 60),
        en: String(mv.en || 'DSH PUBLISHED').slice(0, 80),
        desc: String(mv.desc || '').slice(0, 400),
        dur: String(mv.dur || '').slice(0, 20),
        entry,
        cover: detected,
        frames: frameNames,
        source: mv.source || 'publish',
        collection: null,
        publishedAt: Date.now(),
        bytes: await dirBytes(dir),
      };
      if (collection) {
        const col = ensureCollection(collection);
        meta.collection = col.id;
        addItems(col.id, ['u:' + mid]);
      }
      writeMeta(mid, meta);
      return { id: mid, meta, url: '/custom/' + mid + '/' + entry };
    } catch (e) {
      try { await fsp.rm(dir, { recursive: true, force: true }); } catch (_) {}
      throw e;
    }
  }

  async function deleteMv(id) {
    if (!safeId(id)) throw new Error('MV id 不合法');
    const meta = readMeta(id);
    if (!meta) throw new Error('没有这个 MV');
    await fsp.rm(path.join(mvsDir, id), { recursive: true, force: true });
    const list = loadCollections();
    for (const c of list) c.items = (c.items || []).filter((k) => k !== 'u:' + id);
    saveCollections(list);
    return true;
  }

  async function cleanup() {
    const list = await fsp.readdir(userDir).catch(() => []);
    for (const n of list) {
      if (/^\.(upload|unzip|tmp)-/.test(n)) {
        await fsp.rm(path.join(userDir, n), { recursive: true, force: true }).catch(() => {});
      }
    }
  }
  cleanup().catch(() => {});

  function sourceDir(id, key) {
    if (key && String(key).startsWith('u:')) {
      const m = readMeta(String(key).slice(2));
      return m ? path.join(mvsDir, m.id) : null;
    }
    if (!safeId(id)) return null;
    const m = readMeta(id);
    if (m) return path.join(mvsDir, id);
    const dir = path.join(root, 'ref', 'code', id);
    return fs.existsSync(dir) ? dir : null;
  }

  function framesDir(id, key) {
    if (key && String(key).startsWith('u:')) {
      const m = readMeta(String(key).slice(2));
      return m ? path.join(mvsDir, m.id, 'frames') : null;
    }
    if (!safeId(id)) return null;
    const m = readMeta(id);
    if (m) return path.join(mvsDir, id, 'frames');
    const dir = path.join(root, 'ref', 'frames', id);
    return fs.existsSync(dir) ? dir : null;
  }

  function userMount(id) {
    return safeId(id) ? path.join(mvsDir, id) : null;
  }

  return {
    dataDir, userDir, mvsDir, catalog,
    loadCollections, saveCollections, createCollection, ensureCollection, updateCollection,
    deleteCollection, addItems, removeItems, listUserMvs, readMeta, writeMeta,
    importZip, publish, deleteMv, resolveEntry, resolveCollections, library,
    sourceDir, framesDir, userMount, detectCover, dirBytes, safeId, safeRel, genId,
  };
}

module.exports = { createStore, safeId, safeRel };
