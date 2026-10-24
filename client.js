/* MV 合集 · DSH Client（React） */
window.__ModuleLoader__.load({
  id: 'dsh-mv-hub',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useMemo, useRef, useState, useCallback } = React;

    const CSS = `
    .mvh-root { height: 100%; min-height: 0; overflow: auto; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
    .mvh-wrap { max-width: 1120px; margin: 0 auto; padding: 22px 22px 42px; }
    .mvh-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
    .mvh-kicker { font: 500 10px/1 ui-monospace, monospace; letter-spacing: .22em; color: var(--dsw-alias-label-secondary); text-transform: uppercase; }
    .mvh-title { margin: 8px 0 4px; font-size: 26px; line-height: 1.2; letter-spacing: .02em; }
    .mvh-sub { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.65; max-width: 640px; }
    .mvh-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 22px; align-items: stretch;
      border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); border-radius: 18px; overflow: hidden; margin-bottom: 26px; }
    @media (max-width: 820px) { .mvh-hero { grid-template-columns: 1fr; } }
    .mvh-hero-art { position: relative; min-height: 210px; background: #07080a; cursor: pointer; }
    .mvh-hero-art img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: .92; }
    .mvh-hero-art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 55%, var(--dsw-alias-bg-layer-1)); pointer-events: none; }
    .mvh-playbig { position: absolute; left: 50%; top: 50%; width: 66px; height: 66px; transform: translate(-50%, -50%); border-radius: 50%;
      display: grid; place-items: center; background: rgba(8,9,11,.62); border: 1px solid rgba(255,255,255,.4); color: #fff; backdrop-filter: blur(6px); }
    .mvh-playbig svg { width: 26px; height: 26px; margin-left: 3px; }
    .mvh-hero-body { padding: 22px 22px 22px 6px; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
    .mvh-badge { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; padding: 3px 9px; border-radius: 999px;
      border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-brand-primary); font-size: 11px; letter-spacing: .04em; }
    .mvh-hero-body h2 { margin: 0; font-size: 22px; line-height: 1.3; }
    .mvh-hero-body p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.7; }
    .mvh-meta { display: flex; gap: 8px; flex-wrap: wrap; color: var(--dsw-alias-label-secondary); font-size: 11px; font-family: ui-monospace, monospace; }
    .mvh-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
    .mvh-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 36px; padding: 0 14px; border-radius: 10px;
      border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-primary); font: 500 13px/1 inherit; cursor: pointer; }
    .mvh-btn:hover { border-color: var(--dsw-alias-brand-primary); }
    .mvh-btn.primary { background: var(--dsw-alias-brand-primary); border-color: transparent; color: #fff; }
    .mvh-btn.primary:hover { filter: brightness(1.06); }
    .mvh-btn:disabled { opacity: .55; cursor: default; }
    .mvh-btn svg { width: 16px; height: 16px; }
    .mvh-sec { margin-top: 8px; }
    .mvh-sec h3 { margin: 0 0 3px; font-size: 15px; letter-spacing: .02em; }
    .mvh-sec .mvh-sec-sub { margin: 0 0 14px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
    .mvh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .mvh-card { text-align: left; padding: 0; overflow: hidden; border-radius: 16px; border: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1); color: inherit; font: inherit; cursor: pointer; transition: border-color .15s, transform .15s; }
    .mvh-card:hover { border-color: var(--dsw-alias-border-l2); transform: translateY(-1px); }
    .mvh-thumb { position: relative; aspect-ratio: 16/9; background: #07080a; overflow: hidden; }
    .mvh-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .mvh-thumb.lock img { filter: saturate(.65) brightness(.62); }
    .mvh-lock { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 7px 10px; border-radius: 10px; background: rgba(8,9,11,.8); border: 1px solid rgba(255,255,255,.15); color: #f4ede2; font-size: 11px; }
    .mvh-lock svg { width: 14px; height: 14px; }
    .mvh-time { position: absolute; right: 8px; top: 8px; padding: 2px 7px; border-radius: 6px; background: rgba(0,0,0,.62); color: #eee; font: 500 10px/1.6 ui-monospace, monospace; }
    .mvh-card-body { padding: 12px 13px 14px; }
    .mvh-card-body h4 { margin: 0 0 3px; font-size: 14px; line-height: 1.4; }
    .mvh-card-body .en { margin: 0 0 8px; color: var(--dsw-alias-label-secondary); font: 500 9.5px/1.4 ui-monospace, monospace; letter-spacing: .08em; }
    .mvh-card-body p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.65; }
    .mvh-pkgbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 16px; padding: 11px 13px; border-radius: 12px;
      border: 1px dashed var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); font-size: 12px; }
    .mvh-pkgbar b { color: var(--dsw-alias-label-primary); font-weight: 600; }
    .mvh-pkgbar .grow { flex: 1; min-width: 160px; }
    .mvh-prog { height: 5px; border-radius: 999px; background: var(--dsw-alias-border-l1); overflow: hidden; margin-top: 7px; }
    .mvh-prog i { display: block; height: 100%; background: var(--dsw-alias-brand-primary); transition: width .25s; }
    .mvh-err { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
    .mvh-loading { padding: 60px 0; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 13px; }
    .mvh-overlay { position: fixed; inset: 0; z-index: 9000; background: #050607; display: flex; flex-direction: column; }
    .mvh-overlay-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: #0b0c0f; border-bottom: 1px solid rgba(255,255,255,.1); color: #eee; font-size: 12px; }
    .mvh-overlay iframe { flex: 1; width: 100%; border: 0; background: #000; }
    .mvh-x { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,.22); background: transparent; color: #eee; font-size: 18px; line-height: 1; cursor: pointer; }
    `;

    const I = {
      play: h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, h('path', { d: 'M7.5 4.8v14.4L19.8 12 7.5 4.8Z' })),
      down: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 3v11m0 0 4-4m-4 4-4-4' }), h('path', { d: 'M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' })),
      lock: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }, h('rect', { x: 4, y: 10, width: 16, height: 10, rx: 2 }), h('path', { d: 'M8 10V7a4 4 0 0 1 8 0v3' })),
      film: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }, h('rect', { x: 3, y: 5, width: 18, height: 14, rx: 3 }), h('path', { d: 'M7.5 5v14M16.5 5v14', opacity: '.45' }), h('path', { d: 'm10.5 9.2 5 2.8-5 2.8V9.2Z', fill: 'currentColor', stroke: 'none' })),
    };

    const COVERS = { pdoom: 'pdoom.jpg', world: 'world.jpg', world2: 'world2.jpg', flip: 'flip.jpg', future: 'future.jpg', flip2: 'flip2.jpg', future2: 'future2.jpg', math: 'math.jpg', chemistry: 'chemistry.jpg', hangtian: 'hangtian.jpg', shadow: 'shadow.jpg', deepseek: 'deepseek.jpg', execute: 'execute.jpg' };
    const coverOf = (mv) => '/mv-hub/site/covers/' + (COVERS[mv.id] || mv.cover || 'pdoom.jpg');

    const fmt = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1) + ' GB' : n >= 1e6 ? Math.round(n / 1e6) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');

    function Icon({ size = 22, active }) {
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round',
        style: { opacity: active ? 1 : .78 },
      }, h('rect', { x: 3, y: 5, width: 18, height: 14, rx: 3 }),
        h('path', { d: 'M7.5 5v14M16.5 5v14', opacity: .45 }),
        h('path', { d: 'm10.5 9.2 5 2.8-5 2.8V9.2Z', fill: 'currentColor', stroke: 'none' }));
    }

    function Page() {
      const [cat, setCat] = useState(null);
      const [err, setErr] = useState('');
      const [dl, setDl] = useState({});   // pkg -> {state, got, total, error}
      const [playing, setPlaying] = useState(null); // {title, src}
      const timers = useRef({});

      const load = useCallback(() => {
        fetch('/mv-hub/api/catalog', { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => { setCat(d); setErr(''); })
          .catch((e) => setErr(String(e && e.message || e)));
      }, []);
      useEffect(load, [load]);

      useEffect(() => () => { Object.values(timers.current).forEach(clearInterval); }, []);
      useEffect(() => {
        if (!playing) return;
        const onKey = (e) => { if (e.key === 'Escape') setPlaying(null); };
        const onMsg = (e) => { if (e.data && e.data.type === 'mv-finished') setPlaying(null); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('message', onMsg);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('message', onMsg); };
      }, [playing]);

      const installed = cat ? cat.installed || {} : {};
      const pkgs = cat ? cat.packages || {} : {};

      const start = (pkgId) => {
        const P = pkgs[pkgId];
        setDl((s) => ({ ...s, [pkgId]: { state: 'starting', got: 0, total: P.bytes } }));
        fetch('/mv-hub/api/dl?pkg=' + encodeURIComponent(pkgId), { method: 'POST' })
          .then((r) => r.json())
          .then((j) => { if (!j.ok) throw new Error(j.error || '下载失败'); })
          .catch((e) => setDl((s) => ({ ...s, [pkgId]: { state: 'error', error: String(e.message || e), got: 0, total: P.bytes } })));
        clearInterval(timers.current[pkgId]);
        timers.current[pkgId] = setInterval(async () => {
          try {
            const j = await (await fetch('/mv-hub/api/dl/status?id=' + encodeURIComponent(pkgId), { cache: 'no-store' })).json();
            setDl((s) => ({ ...s, [pkgId]: { ...j } }));
            if (j.state === 'done') { clearInterval(timers.current[pkgId]); load(); }
            if (j.state === 'error' || j.state === 'canceled') clearInterval(timers.current[pkgId]);
          } catch (e) { /* keep polling */ }
        }, 800);
      };

      const play = (mv) => {
        if (mv.pkg && !installed[mv.pkg]) { start(mv.pkg); return; }
        const src = mv.pkg ? '/custom/' + mv.pkg + '/' + mv.path : '/mv-hub/site/' + mv.file;
        setPlaying({ title: mv.title, src: src + (src.includes('?') ? '&' : '?') + 'embed=1' });
      };

      if (!cat) return h('div', { className: 'mvh-root' }, h('div', { className: 'mvh-wrap' }, h('div', { className: 'mvh-loading' }, err ? '加载失败：' + err : '正在加载 MV 合集…')));
      const def = cat.mvs.find((m) => m.id === cat.default) || cat.mvs[0];
      const rest = cat.mvs.filter((m) => m.id !== def.id);

      const pkgBar = (pkgId) => {
        const P = pkgs[pkgId]; if (!P) return null;
        const st = dl[pkgId];
        const done = installed[pkgId];
        const pct = st && st.total ? Math.min(99, Math.round((st.got || 0) / st.total * 100)) : 0;
        return h('div', { className: 'mvh-pkgbar', key: pkgId },
          h('span', { className: 'grow' },
            h('b', null, P.title), ' · ', done ? '已下载，可离线播放' : '可选扩展 · 第一次播放时自动下载 ' + fmt(P.bytes),
            st && st.state === 'downloading' ? h('div', { className: 'mvh-prog' }, h('i', { style: { width: pct + '%' } })) : null),
          st && (st.state === 'downloading' || st.state === 'unzipping') ? h('span', null, st.state === 'unzipping' ? '解压中…' : pct + '%') : null,
          st && st.state === 'error' ? h('span', { className: 'mvh-err' }, '失败：' + st.error) : null,
          !done && (!st || st.state === 'error' || st.state === 'canceled')
            ? h('button', { className: 'mvh-btn', type: 'button', onClick: () => start(pkgId) }, I.down, '下载 ' + fmt(P.bytes))
            : null);
      };

      return h(React.Fragment, null,
        h('div', { className: 'mvh-root' },
        h('style', null, CSS),
        h('div', { className: 'mvh-wrap' },
          h('header', { className: 'mvh-head' },
            h('div', null,
              h('div', { className: 'mvh-kicker' }, 'Code Music Video · Collections / v' + cat.version),
              h('h1', { className: 'mvh-title' }, 'MV 合集'),
              h('p', { className: 'mvh-sub' }, '默认内置 P(doom)。其他合集只放封面，第一次播放时从 Cloudflare R2 下载；下载过的会留在本机。')),
            h('div', { className: 'mvh-meta' }, h('span', null, '13 支作品'), h('span', null, '4 个可选包'))),

          h('section', { className: 'mvh-hero' },
            h('div', { className: 'mvh-hero-art', onClick: () => play(def), role: 'button', tabIndex: 0,
              onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') play(def); } },
              h('img', { src: coverOf(def), alt: def.title }),
              h('span', { className: 'mvh-playbig' }, I.play)),
            h('div', { className: 'mvh-hero-body' },
              h('span', { className: 'mvh-badge' }, '默认 MV · 打开先看这一支'),
              h('h2', null, def.title),
              h('div', { className: 'mvh-meta' }, h('span', null, def.en), h('span', null, def.dur), h('span', null, '18 镜')),
              h('p', null, def.desc),
              h('div', { className: 'mvh-row' }, h('button', { className: 'mvh-btn primary', type: 'button', onClick: () => play(def) }, I.play, '立即播放')))),

          h('section', { className: 'mvh-sec' },
            h('h3', null, '合集扩展'),
            h('p', { className: 'mvh-sec-sub' }, '只显示封面；点一下开始下载，下载完就能播，不用重新打开页面。'),
            ['ai', 'science', 'letters', 'execute'].map(pkgBar),
            h('div', { className: 'mvh-grid' },
              rest.map((mv) => {
                const locked = mv.pkg && !installed[mv.pkg];
                const P = mv.pkg ? pkgs[mv.pkg] : null;
                const st = mv.pkg ? dl[mv.pkg] : null;
                const busy = st && (st.state === 'downloading' || st.state === 'unzipping' || st.state === 'starting');
                return h('button', { className: 'mvh-card', key: mv.id, type: 'button', onClick: () => play(mv) },
                  h('div', { className: 'mvh-thumb' + (locked ? ' lock' : '') },
                    h('img', { src: coverOf(mv), alt: mv.title }),
                    h('span', { className: 'mvh-time' }, mv.dur),
                    locked ? h('span', { className: 'mvh-lock' },
                      h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, I.lock, busy ? (st.state === 'unzipping' ? '解压中…' : Math.round((st.got || 0) / (st.total || 1) * 100) + '%') : '需下载'),
                      h('span', null, P ? fmt(P.bytes) : '')) : null),
                  h('div', { className: 'mvh-card-body' },
                    h('h4', null, mv.title),
                    h('div', { className: 'en' }, mv.en),
                    h('p', null, mv.sub + ' · ' + mv.desc)));
              }))))),
        playing ? h(Player, { info: playing, onClose: () => setPlaying(null) }) : null);
    }

    function Player({ info, onClose }) {
      return h('div', { className: 'mvh-overlay' },
        h('style', null, CSS),
        h('div', { className: 'mvh-overlay-bar' },
          h('button', { className: 'mvh-x', type: 'button', onClick: onClose, 'aria-label': '关闭播放器' }, '×'),
          h('span', { style: { flex: 1, textAlign: 'center' } }, '正在播放 · ' + info.title + '（点一下画面开始）'),
          h('span', { style: { width: 32 } })),
        h('button', {
          className: 'mvh-btn', type: 'button', onClick: onClose,
          style: { position: 'fixed', right: 18, bottom: 18, zIndex: 9500, background: 'rgba(8,9,11,.82)', color: '#fff', borderColor: 'rgba(255,255,255,.35)', backdropFilter: 'blur(8px)' },
        }, '✕ 关闭播放器'),
        h('iframe', { src: info.src, allow: 'autoplay; fullscreen; encrypted-media', title: info.title }));
    }

    function Shell() {
      const [playing, setPlaying] = useState(null);
      const ref = useRef(null);
      useEffect(() => {
        const f = () => setPlaying(window.__mvhPlaying || null);
        window.addEventListener('mvh-playing', f);
        return () => window.removeEventListener('mvh-playing', f);
      }, []);
      return h(React.Fragment, null,
        h('div', { ref }),
        h(Page, null));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'mv' }, Page));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'mv', order: 20, label: 'MV 合集' }, Icon));
      },
    };
  },
});
