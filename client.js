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

    const BOOT_CATALOG = {"version": "1.1.0", "product": "MV渲染器", "default": "pdoom", "sourceRepo": "https://github.com/xunfe/mv-renderer", "packages": {"ai": {"title": "AI娘角色主题曲MV", "bytes": 228732166, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/ai.zip", "sha256": "68e2f5759e2cf464a5c8b68716f9f802e56fa1c93d2b5b38bd00b2bf84efb811"}, "science": {"title": "科普简史", "bytes": 45920569, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/science.zip", "sha256": "8b7fe509e400fad0521fac098c80456a4f455823a4648b0d44d0b1f41ceef31a"}, "letters": {"title": "大肥鱼的情书", "bytes": 4537851, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/letters.zip", "sha256": "38db0aeec8381d4f75fc3dac986daf76ba536b4466a2b33d4537f036c5a6c5ca"}, "execute": {"title": "word excuse me", "bytes": 4112806, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/execute.zip", "sha256": "4c6548499d100fa9a225491d0cd567cb20f0ff06763932b7c684f1da0fe11a4e"}}, "mvs": [{"id": "pdoom", "title": "I'm Upping My P(doom)", "sub": "中文本地化", "en": "I'M UPPING MY P(DOOM)", "desc": "默认 MV。逐词双语歌词、18 个镜头，打开先看这一支。", "dur": "2:37", "pkg": null, "path": null, "file": "index.html", "cover": "pdoom.jpg", "frames": 0}, {"id": "world", "title": "世界还在写", "sub": "AI娘角色主题曲", "en": "THE WORLD IS STILL WRITING", "desc": "橙子、小海与大肥鱼三个角色，一支关于「写下去」的角色主题曲。", "dur": "3:24", "pkg": "ai", "path": "mv/world/index.html", "file": null, "cover": "world.jpg", "frames": 1}, {"id": "world2", "title": "世界还在写 · 墨海版", "sub": "我的重绘版 · 原版画法", "en": "THE WORLD IS STILL WRITING · INK SEA", "desc": "同一首歌，另一套「墨 / 海 / 页」的视觉；画面重写，人物沿用原版。", "dur": "3:24", "pkg": "ai", "path": "mv/world2/index.html", "file": null, "cover": "world2.jpg", "frames": 6}, {"id": "flip", "title": "我只是翻了个身", "sub": "大肥鱼的角色主题曲", "en": "I JUST TURNED OVER", "desc": "K 线海浪、灯塔与一次翻身，全片浏览器实时绘制。", "dur": "1:59", "pkg": "ai", "path": "mv/flip/index.html", "file": null, "cover": "flip.jpg", "frames": 1}, {"id": "future", "title": "那年你叫我未来", "sub": "姐姐的角色主题曲", "en": "YOU CALLED ME THE FUTURE", "desc": "从那年冬天的窗口出发，一路写到未来。", "dur": "2:36", "pkg": "ai", "path": "mv/future/index.html", "file": null, "cover": "future.jpg", "frames": 1}, {"id": "flip2", "title": "我只是翻了个身 · 深海版", "sub": "我的重绘版 · 原版画法", "en": "I JUST TURNED OVER · DEEP SEA", "desc": "数字海、红绿 K 线浪、藏灯、地图铺海面；逐句卡点。", "dur": "1:59", "pkg": "ai", "path": "mv/flip2/index.html", "file": null, "cover": "flip2.jpg", "frames": 6}, {"id": "future2", "title": "那年你叫我未来 · 晨光版", "sub": "我的重绘版 · 原版画法", "en": "YOU CALLED ME THE FUTURE · FIRST LIGHT", "desc": "对话框、破窗、一起飞出去，最后说一声早安。", "dur": "2:36", "pkg": "ai", "path": "mv/future2/index.html", "file": null, "cover": "future2.jpg", "frames": 6}, {"id": "math", "title": "数学简史", "sub": "两万年", "en": "A BRIEF HISTORY OF MATHEMATICS", "desc": "按原片 62 个真实切点逐镜重画，从骨上刻痕到千禧年难题。", "dur": "2:40", "pkg": "science", "path": "mv/math/index.html", "file": null, "cover": "math.jpg", "frames": 1}, {"id": "chemistry", "title": "化学简史", "sub": "118 种元素", "en": "A BRIEF HISTORY OF CHEMISTRY", "desc": "从石墨到 118 号元素，把整张周期表压进一首歌。", "dur": "3:38", "pkg": "science", "path": "mv/chemistry/index.html", "file": null, "cover": "chemistry.jpg", "frames": 1}, {"id": "hangtian", "title": "航天简史", "sub": "八十年", "en": "A SHORT HISTORY OF AEROSPACE", "desc": "1944 → 2026，V-2 到星舰，用真实影像重走一遍。", "dur": "4:11", "pkg": "science", "path": "mv/hangtian/index.html", "file": null, "cover": "hangtian.jpg", "frames": 1}, {"id": "shadow", "title": "地理简史", "sub": "The Shadow Line", "en": "A BRIEF HISTORY OF GEOGRAPHY", "desc": "一句词一张卡，从埃拉托色尼追到胡焕庸线。", "dur": "2:54", "pkg": "science", "path": "mv/shadow/index.html", "file": null, "cover": "shadow.jpg", "frames": 1}, {"id": "deepseek", "title": "一封情书", "sub": "DeepSeek", "en": "A LOVE LETTER TO CHINA", "desc": "只取原片音轨，30 句旁白、33 个镜头全部重写重画。", "dur": "2:14", "pkg": "letters", "path": "mv/deepseek/index.html", "file": null, "cover": "deepseek.jpg", "frames": 1}, {"id": "execute", "title": "world.execute (me) ;", "sub": "全代码离线版", "en": "WORLD.EXECUTE (ME) ;", "desc": "304 个镜头、全代码离线渲染；原曲需自备。", "dur": "3:32", "pkg": "execute", "path": "execute/index.html", "file": null, "cover": "execute.jpg", "frames": 1}], "installed": {"ai": false, "science": false, "letters": true, "execute": true}};

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
      const [cat, setCat] = useState(BOOT_CATALOG);
      const [err, setErr] = useState('');
      const [dl, setDl] = useState({});   // pkg -> {state, got, total, error}
      const [playing, setPlaying] = useState(null); // {title, src}
      const timers = useRef({});

      const load = useCallback((attempt = 0) => {
        fetch('/mv-hub/api/catalog', { cache: 'no-store' })
          .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then((d) => { setCat(d); setErr(''); })
          .catch((e) => {
            if (attempt < 6) { setTimeout(() => load(attempt + 1), 400); return; }
            setErr(String(e && e.message || e));
          });
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
