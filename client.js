/* MV 合集 · DSH Client（React） */
window.__ModuleLoader__.load({
  id: 'dsh-mv-hub',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useRef, useState, useCallback } = React;

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
    .mvh-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
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
    .mvh-sec-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 24px 0 12px; }
    .mvh-sec-head h3 { margin: 0; font-size: 16px; }
    .mvh-sec-head .mvh-sec-sub { margin: 2px 0 0; }
    .mvh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .mvh-card { text-align: left; padding: 0; overflow: hidden; border-radius: 16px; border: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1); color: inherit; font: inherit; cursor: pointer; transition: border-color .15s, transform .15s; }
    .mvh-card:hover { border-color: var(--dsw-alias-border-l2); transform: translateY(-1px); }
    .mvh-thumb { position: relative; aspect-ratio: 16/9; background: #07080a; overflow: hidden; }
    .mvh-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .mvh-thumb.lock img { filter: saturate(.65) brightness(.62); }
    .mvh-thumb .ph { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.3); }
    .mvh-thumb .ph svg { width: 42px; height: 42px; }
    .mvh-lock { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 7px 10px; border-radius: 10px; background: rgba(8,9,11,.8); border: 1px solid rgba(255,255,255,.15); color: #f4ede2; font-size: 11px; }
    .mvh-lock svg { width: 14px; height: 14px; }
    .mvh-time { position: absolute; right: 8px; top: 8px; padding: 2px 7px; border-radius: 6px; background: rgba(0,0,0,.62); color: #eee; font: 500 10px/1.6 ui-monospace, monospace; }
    .mvh-card-body { padding: 12px 13px 14px; }
    .mvh-card-body h4 { margin: 0 0 3px; font-size: 14px; line-height: 1.4; }
    .mvh-card-body .en { margin: 0 0 8px; color: var(--dsw-alias-label-secondary); font: 500 9.5px/1.4 ui-monospace, monospace; letter-spacing: .08em; }
    .mvh-card-body p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.65; }
    .mvh-item { position: relative; display: block; }
    .mvh-item > .mvh-card { width: 100%; }
    .mvh-rm { position: absolute; right: 7px; top: 7px; z-index: 3; width: 27px; height: 27px; border-radius: 9px; line-height: 1;
      border: 1px solid rgba(255,255,255,.28); background: rgba(8,9,11,.66); color: #fff; font-size: 15px; cursor: pointer; backdrop-filter: blur(5px); }
    .mvh-rm:hover { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
    .mvh-coll-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
    .mvh-coll { position: relative; text-align: left; padding: 0; overflow: hidden; border-radius: 16px; cursor: pointer; color: inherit; font: inherit;
      border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); transition: border-color .15s, transform .15s; }
    .mvh-coll:hover { border-color: var(--dsw-alias-brand-primary); transform: translateY(-1px); }
    .mvh-coll .art { position: relative; aspect-ratio: 16/9; background: linear-gradient(135deg, #191c22, #08090b); overflow: hidden; }
    .mvh-coll .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .mvh-coll .art .ph { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.28); }
    .mvh-coll .art .ph svg { width: 40px; height: 40px; }
    .mvh-coll .cnt { position: absolute; right: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.6);
      color: #eee; font: 500 10px/1.7 ui-monospace, monospace; }
    .mvh-coll .body { padding: 11px 13px 13px; }
    .mvh-coll .body b { display: block; font-size: 14px; line-height: 1.4; margin-bottom: 3px; }
    .mvh-coll .body small { display: block; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.6;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mvh-coll.new { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 176px;
      border-style: dashed; background: transparent; color: var(--dsw-alias-label-secondary); }
    .mvh-coll.new b { font-size: 13.5px; color: var(--dsw-alias-label-primary); }
    .mvh-coll.new small { font-size: 11px; }
    .mvh-coll.new .plus svg { width: 26px; height: 26px; }
    .mvh-detail-head { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; margin: 2px 0 18px; }
    .mvh-detail-head .grow { flex: 1; min-width: 180px; }
    .mvh-empty { border: 1px dashed var(--dsw-alias-border-l2); border-radius: 14px; padding: 30px 18px; text-align: center;
      color: var(--dsw-alias-label-secondary); font-size: 12.5px; line-height: 1.8; }
    .mvh-empty b { display: block; color: var(--dsw-alias-label-primary); font-size: 14px; margin-bottom: 4px; }
    .mvh-pkgbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 16px; padding: 11px 13px; border-radius: 12px;
      border: 1px dashed var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); font-size: 12px; }
    .mvh-pkgbar b { color: var(--dsw-alias-label-primary); font-weight: 600; }
    .mvh-pkgbar .grow { flex: 1; min-width: 160px; }
    .mvh-prog { height: 5px; border-radius: 999px; background: var(--dsw-alias-border-l1); overflow: hidden; margin-top: 7px; }
    .mvh-prog i { display: block; height: 100%; background: var(--dsw-alias-brand-primary); transition: width .25s; }
    .mvh-err { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
    .mvh-loading { padding: 60px 0; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 13px; }
    .mvh-modal { position: fixed; inset: 0; z-index: 9200; background: rgba(3,4,6,.62); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 18px; }
    .mvh-dialog { width: min(540px, 100%); max-height: calc(100vh - 70px); overflow: auto; padding: 20px; border-radius: 16px;
      border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); box-shadow: 0 24px 64px rgba(0,0,0,.45); }
    .mvh-dialog h3 { margin: 0 0 6px; font-size: 17px; }
    .mvh-dialog .hint { margin: 0 0 16px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.65; }
    .mvh-field { display: block; margin-bottom: 12px; }
    .mvh-field > span { display: block; margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
    .mvh-input, .mvh-select { width: 100%; box-sizing: border-box; height: 38px; padding: 0 11px; border-radius: 10px;
      border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font: 13px/1.4 inherit; }
    textarea.mvh-input { height: 76px; padding: 9px 11px; resize: vertical; }
    .mvh-drop { padding: 24px 14px; text-align: center; border-radius: 12px; cursor: pointer; color: var(--dsw-alias-label-secondary);
      border: 1px dashed var(--dsw-alias-border-l2); font-size: 12.5px; line-height: 1.7; }
    .mvh-drop b { display: block; color: var(--dsw-alias-label-primary); font-size: 13px; margin-bottom: 3px; }
    .mvh-drop.drag { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
    .mvh-dialog-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 16px; }
    .mvh-picks { max-height: 300px; overflow: auto; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; }
    .mvh-pick { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-bottom: 1px solid var(--dsw-alias-border-l1);
      font-size: 12.5px; cursor: pointer; }
    .mvh-pick:last-child { border-bottom: 0; }
    .mvh-pick:hover { background: var(--dsw-alias-bg-layer-2, rgba(127,127,127,.06)); }
    .mvh-pick img { width: 56px; height: 32px; object-fit: cover; border-radius: 5px; background: #000; flex: none; }
    .mvh-pick .pick-ph { width: 56px; height: 32px; border-radius: 5px; background: #101114; flex: none; }
    .mvh-pick input { flex: none; accent-color: var(--dsw-alias-brand-primary); }
    .mvh-pick .t { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mvh-pick .t small { color: var(--dsw-alias-label-secondary); margin-left: 6px; }
    .mvh-toast { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 9600; padding: 9px 16px; border-radius: 999px;
      background: rgba(8,9,11,.92); border: 1px solid rgba(255,255,255,.18); color: #fff; font-size: 12.5px; max-width: 86vw; }
    .mvh-overlay { position: fixed; inset: 0; z-index: 9000; background: #050607; display: flex; flex-direction: column; }
    .mvh-overlay-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: #0b0c0f; border-bottom: 1px solid rgba(255,255,255,.1); color: #eee; font-size: 12px; }
    .mvh-overlay iframe { flex: 1; width: 100%; border: 0; background: #000; }
    .mvh-x { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,.22); background: transparent; color: #eee; font-size: 18px; line-height: 1; cursor: pointer; }
    `;

    const BOOT_CATALOG =  {"version": "1.1.0", "product": "MV渲染器", "default": "pdoom", "sourceRepo": "https://github.com/xunfe/mv-renderer", "packages": {"ai": {"title": "AI娘角色主题曲MV", "bytes": 228732166, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/ai.zip", "sha256": "68e2f5759e2cf464a5c8b68716f9f802e56fa1c93d2b5b38bd00b2bf84efb811"}, "science": {"title": "科普简史", "bytes": 45920569, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/science.zip", "sha256": "8b7fe509e400fad0521fac098c80456a4f455823a4648b0d44d0b1f41ceef31a"}, "letters": {"title": "大肥鱼的情书", "bytes": 4537851, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/letters.zip", "sha256": "38db0aeec8381d4f75fc3dac986daf76ba536b4466a2b33d4537f036c5a6c5ca"}, "execute": {"title": "word excuse me", "bytes": 4112806, "url": "https://pub-1afc957e032a4de18e300f40f21195f1.r2.dev/mv/1.1.0/execute.zip", "sha256": "4c6548499d100fa9a225491d0cd567cb20f0ff06763932b7c684f1da0fe11a4e"}}, "mvs": [{"id": "pdoom", "title": "I'm Upping My P(doom)", "sub": "中文本地化", "en": "I'M UPPING MY P(DOOM)", "desc": "默认 MV。逐词双语歌词、18 个镜头，打开先看这一支。", "dur": "2:37", "pkg": null, "path": null, "file": "index.html", "cover": "pdoom.jpg", "frames": 0}, {"id": "world", "title": "世界还在写", "sub": "AI娘角色主题曲", "en": "THE WORLD IS STILL WRITING", "desc": "橙子、小海与大肥鱼三个角色，一支关于「写下去」的角色主题曲。", "dur": "3:24", "pkg": "ai", "path": "mv/world/index.html", "file": null, "cover": "world.jpg", "frames": 1}, {"id": "world2", "title": "世界还在写 · 墨海版", "sub": "我的重绘版 · 原版画法", "en": "THE WORLD IS STILL WRITING · INK SEA", "desc": "同一首歌，另一套「墨 / 海 / 页」的视觉；画面重写，人物沿用原版。", "dur": "3:24", "pkg": "ai", "path": "mv/world2/index.html", "file": null, "cover": "world2.jpg", "frames": 6}, {"id": "flip", "title": "我只是翻了个身", "sub": "大肥鱼的角色主题曲", "en": "I JUST TURNED OVER", "desc": "K 线海浪、灯塔与一次翻身，全片浏览器实时绘制。", "dur": "1:59", "pkg": "ai", "path": "mv/flip/index.html", "file": null, "cover": "flip.jpg", "frames": 1}, {"id": "future", "title": "那年你叫我未来", "sub": "姐姐的角色主题曲", "en": "YOU CALLED ME THE FUTURE", "desc": "从那年冬天的窗口出发，一路写到未来。", "dur": "2:36", "pkg": "ai", "path": "mv/future/index.html", "file": null, "cover": "future.jpg", "frames": 1}, {"id": "flip2", "title": "我只是翻了个身 · 深海版", "sub": "我的重绘版 · 原版画法", "en": "I JUST TURNED OVER · DEEP SEA", "desc": "数字海、红绿 K 线浪、藏灯、地图铺海面；逐句卡点。", "dur": "1:59", "pkg": "ai", "path": "mv/flip2/index.html", "file": null, "cover": "flip2.jpg", "frames": 6}, {"id": "future2", "title": "那年你叫我未来 · 晨光版", "sub": "我的重绘版 · 原版画法", "en": "YOU CALLED ME THE FUTURE · FIRST LIGHT", "desc": "对话框、破窗、一起飞出去，最后说一声早安。", "dur": "2:36", "pkg": "ai", "path": "mv/future2/index.html", "file": null, "cover": "future2.jpg", "frames": 6}, {"id": "math", "title": "数学简史", "sub": "两万年", "en": "A BRIEF HISTORY OF MATHEMATICS", "desc": "按原片 62 个真实切点逐镜重画，从骨上刻痕到千禧年难题。", "dur": "2:40", "pkg": "science", "path": "mv/math/index.html", "file": null, "cover": "math.jpg", "frames": 1}, {"id": "chemistry", "title": "化学简史", "sub": "118 种元素", "en": "A BRIEF HISTORY OF CHEMISTRY", "desc": "从石墨到 118 号元素，把整张周期表压进一首歌。", "dur": "3:38", "pkg": "science", "path": "mv/chemistry/index.html", "file": null, "cover": "chemistry.jpg", "frames": 1}, {"id": "hangtian", "title": "航天简史", "sub": "八十年", "en": "A SHORT HISTORY OF AEROSPACE", "desc": "1944 → 2026，V-2 到星舰，用真实影像重走一遍。", "dur": "4:11", "pkg": "science", "path": "mv/hangtian/index.html", "file": null, "cover": "hangtian.jpg", "frames": 1}, {"id": "shadow", "title": "地理简史", "sub": "The Shadow Line", "en": "A BRIEF HISTORY OF GEOGRAPHY", "desc": "一句词一张卡，从埃拉托色尼追到胡焕庸线。", "dur": "2:54", "pkg": "science", "path": "mv/shadow/index.html", "file": null, "cover": "shadow.jpg", "frames": 1}, {"id": "deepseek", "title": "一封情书", "sub": "DeepSeek", "en": "A LOVE LETTER TO CHINA", "desc": "只取原片音轨，30 句旁白、33 个镜头全部重写重画。", "dur": "2:14", "pkg": "letters", "path": "mv/deepseek/index.html", "file": null, "cover": "deepseek.jpg", "frames": 1}, {"id": "execute", "title": "world.execute (me) ;", "sub": "全代码离线版", "en": "WORLD.EXECUTE (ME) ;", "desc": "304 个镜头、全代码离线渲染；原曲需自备。", "dur": "3:32", "pkg": "execute", "path": "execute/index.html", "file": null, "cover": "execute.jpg", "frames": 1}], "installed": {"ai": false, "science": false, "letters": true, "execute": true}};

    const I = {
      play: h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, h('path', { d: 'M7.5 4.8v14.4L19.8 12 7.5 4.8Z' })),
      down: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 3v11m0 0 4-4m-4 4-4-4' }), h('path', { d: 'M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' })),
      lock: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }, h('rect', { x: 4, y: 10, width: 16, height: 10, rx: 2 }), h('path', { d: 'M8 10V7a4 4 0 0 1 8 0v3' })),
      film: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }, h('rect', { x: 3, y: 5, width: 18, height: 14, rx: 3 }), h('path', { d: 'M7.5 5v14M16.5 5v14', opacity: '.45' }), h('path', { d: 'm10.5 9.2 5 2.8-5 2.8V9.2Z', fill: 'currentColor', stroke: 'none' })),
      plus: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, h('path', { d: 'M12 5v14M5 12h14' })),
      imp: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M12 3v11m0 0 4-4m-4 4-4-4' }), h('path', { d: 'M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' })),
      back: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'm14.5 5.5-6.5 6.5 6.5 6.5' })),
      trash: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v5M14 11v5' })),
      check: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'm5 12.5 4.5 4.5L19 7' })),
    };

    const COVERS = { pdoom: 'pdoom.jpg', world: 'world.jpg', world2: 'world2.jpg', flip: 'flip.jpg', future: 'future.jpg', flip2: 'flip2.jpg', future2: 'future2.jpg', math: 'math.jpg', chemistry: 'chemistry.jpg', hangtian: 'hangtian.jpg', shadow: 'shadow.jpg', deepseek: 'deepseek.jpg', execute: 'execute.jpg' };
    const coverOf = (mv) => '/mv-hub/site/covers/' + (COVERS[mv.id] || mv.cover || 'pdoom.jpg');
    const fmt = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1) + ' GB' : n >= 1e6 ? Math.round(n / 1e6) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
    const enc = encodeURIComponent;

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
      const [dl, setDl] = useState({});       // pkg -> {state, got, total, error}
      const [playing, setPlaying] = useState(null);
      const [view, setView] = useState(null); // 合集 id
      const [modal, setModal] = useState(null);
      const [toast, setToast] = useState('');
      const [busy, setBusy] = useState(false);
      const [upload, setUpload] = useState(null);
      const timers = useRef({});
      const toastTimer = useRef(null);
      const rootRef = useRef(null);
      const fileRef = useRef(null);

      const say = (m) => {
        setToast(String(m));
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 2800);
      };

      const load = useCallback((attempt = 0) => {
        fetch('/mv-hub/api/catalog', { cache: 'no-store' })
          .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then((d) => { setCat(d); setErr(''); })
          .catch((e) => {
            if (attempt < 6) { setTimeout(() => load(attempt + 1), 400); return; }
            setErr(String((e && e.message) || e));
          });
      }, []);
      useEffect(load, [load]);

      useEffect(() => () => { Object.values(timers.current).forEach(clearInterval); clearTimeout(toastTimer.current); }, []);
      useEffect(() => { if (view && rootRef.current) rootRef.current.scrollTop = 0; }, [view]);
      useEffect(() => {
        if (!playing) return;
        const onKey = (e) => { if (e.key === 'Escape') setPlaying(null); };
        const onMsg = (e) => { if (e.data && e.data.type === 'mv-finished') setPlaying(null); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('message', onMsg);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('message', onMsg); };
      }, [playing]);

      const installed = (cat && cat.installed) || {};
      const pkgs = (cat && cat.packages) || {};
      const cols = (cat && cat.collections) || [];
      const builtin = ((cat && cat.mvs) || []).map((m) => ({
        ...m, key: m.id, kind: m.pkg ? 'pkg' : 'builtin',
        cover: coverOf(m), src: m.pkg ? '/custom/' + m.pkg + '/' + m.path : '/mv-hub/site/' + m.file,
      }));
      const lib = (cat && cat.library) || [];
      const all = builtin.concat(lib);
      const current = view ? cols.find((c) => c.id === view) : null;

      const api = (p, body) => fetch('/mv-hub/api/' + p, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
      }).then((r) => r.json());

      const play = (e) => {
        if (!e) return;
        if (e.kind === 'pkg' && !installed[e.pkg]) { start(e.pkg); say('先下载「' + (pkgs[e.pkg] ? pkgs[e.pkg].title : e.pkg) + '」，下完就能播'); return; }
        const src = e.src || (e.pkg ? '/custom/' + e.pkg + '/' + e.path : '/mv-hub/site/' + e.file);
        setPlaying({ title: e.title, src });
      };

      const start = (pkgId) => {
        const P = pkgs[pkgId];
        if (!P) return;
        setDl((s) => ({ ...s, [pkgId]: { state: 'starting', got: 0, total: P.bytes } }));
        fetch('/mv-hub/api/dl?pkg=' + enc(pkgId), { method: 'POST' })
          .then((r) => r.json())
          .then((j) => { if (!j.ok) throw new Error(j.error || '下载失败'); })
          .catch((e) => setDl((s) => ({ ...s, [pkgId]: { state: 'error', error: String(e.message || e), got: 0, total: P.bytes } })));
        clearInterval(timers.current[pkgId]);
        timers.current[pkgId] = setInterval(async () => {
          try {
            const j = await (await fetch('/mv-hub/api/dl/status?id=' + enc(pkgId), { cache: 'no-store' })).json();
            setDl((s) => ({ ...s, [pkgId]: { ...j } }));
            if (j.state === 'done') { clearInterval(timers.current[pkgId]); load(); }
            if (j.state === 'error' || j.state === 'canceled') clearInterval(timers.current[pkgId]);
          } catch (e) { /* keep polling */ }
        }, 800);
      };

      const saveCollection = async (form) => {
        if (!String(form.title || '').trim()) return say('合集名不能为空');
        setBusy(true);
        try {
          const j = await api('collection/save', form);
          if (!j.ok) throw new Error(j.error || '保存失败');
          await load();
          setModal(null);
          say(form.id ? '合集已更新' : '合集已新建');
        } catch (e) { say(String(e.message || e)); }
        finally { setBusy(false); }
      };

      const removeItem = async (key) => {
        try {
          const j = await api('collection/items', { id: view, remove: [key] });
          if (!j.ok) throw new Error(j.error || '操作失败');
          await load();
        } catch (e) { say(String(e.message || e)); }
      };

      const addWorks = async () => {
        const keys = Object.keys((modal && modal.keys) || {}).filter((k) => modal.keys[k]);
        if (!keys.length) return say('先选几支作品');
        setBusy(true);
        try {
          const j = await api('collection/items', { id: modal.id, add: keys });
          if (!j.ok) throw new Error(j.error || '添加失败');
          await load();
          setModal(null);
          say('已加入 ' + keys.length + ' 支作品');
        } catch (e) { say(String(e.message || e)); }
        finally { setBusy(false); }
      };

      const doDeleteCollection = async () => {
        setBusy(true);
        try {
          const j = await api('collection/delete', { id: modal.id });
          if (!j.ok) throw new Error(j.error || '删除失败');
          await load();
          setModal(null);
          setView(null);
          say('合集已删除');
        } catch (e) { say(String(e.message || e)); }
        finally { setBusy(false); }
      };

      const doDeleteMv = async () => {
        setBusy(true);
        try {
          const j = await api('mv/delete', { id: modal.id });
          if (!j.ok) throw new Error(j.error || '删除失败');
          await load();
          setModal(null);
          say('已删除 ' + (modal.title || ''));
        } catch (e) { say(String(e.message || e)); }
        finally { setBusy(false); }
      };

      const doImport = () => {
        const f = modal && modal.file;
        if (!f) return say('先选一个 zip');
        const xhr = new XMLHttpRequest();
        const q = '?name=' + enc(f.name) + '&title=' + enc(modal.title || f.name.replace(/\.zip$/i, '')) + '&collection=' + enc(modal.collection || '');
        xhr.open('POST', '/mv-hub/api/import' + q);
        xhr.setRequestHeader('Content-Type', 'application/zip');
        setUpload({ pct: 0, state: 'uploading' });
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUpload({ pct: Math.round(e.loaded / e.total * 100), state: 'uploading' }); };
        xhr.onload = async () => {
          let j = {};
          try { j = JSON.parse(xhr.responseText); } catch (_) {}
          if (j.ok) {
            setUpload(null);
            setModal(null);
            await load();
            say('导入成功：' + (j.title || ''));
          } else {
            setUpload({ state: 'error', error: j.error || ('HTTP ' + xhr.status) });
          }
        };
        xhr.onerror = () => setUpload({ state: 'error', error: '网络错误' });
        xhr.send(f);
      };

      const playCard = (e, extra) => {
        const locked = e.kind === 'pkg' && !installed[e.pkg];
        const st = e.pkg ? dl[e.pkg] : null;
        const busyDl = st && (st.state === 'downloading' || st.state === 'unzipping' || st.state === 'starting');
        return h('button', { className: 'mvh-card', key: e.key || e.id, type: 'button', onClick: () => play(e) },
          h('div', { className: 'mvh-thumb' + (locked ? ' lock' : '') },
            e.cover ? h('img', { src: e.cover, alt: e.title, loading: 'lazy' })
              : h('span', { className: 'ph' }, I.film),
            h('span', { className: 'mvh-time' }, e.dur || (e.kind === 'user' ? '我的' : 'MV')),
            locked ? h('span', { className: 'mvh-lock' },
              h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, I.lock,
                busyDl ? (st.state === 'unzipping' ? '解压中…' : Math.round((st.got || 0) / (st.total || 1) * 100) + '%') : '需下载'),
              h('span', null, pkgs[e.pkg] ? fmt(pkgs[e.pkg].bytes) : '')) : null),
          h('div', { className: 'mvh-card-body' },
            h('h4', null, e.title),
            h('div', { className: 'en' }, e.en || (e.kind === 'user' ? 'MY MV' : '')),
            h('p', null, [e.sub, e.desc].filter(Boolean).join(' · ') || (e.kind === 'user' ? '导入 / 发布的 MV' : ''))),
          extra || null);
      };

      const collectionCard = (c) => h('button', { className: 'mvh-coll', key: c.id, type: 'button', onClick: () => setView(c.id) },
        h('div', { className: 'art' },
          c.cover ? h('img', { src: c.cover, alt: c.title, loading: 'lazy' }) : h('span', { className: 'ph' }, I.film),
          h('span', { className: 'cnt' }, c.count + ' 支')),
        h('div', { className: 'body' },
          h('b', null, c.title),
          h('small', null, c.count ? (c.desc || '打开看合集里的作品') : '空合集 · 点开添加作品')));

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

      /* ---------- 弹窗 ---------- */
      const modalBox = (title, hint, children, footer) => h('div', {
        className: 'mvh-modal', onClick: () => { if (!busy) { setModal(null); setUpload(null); } },
      }, h('div', { className: 'mvh-dialog', onClick: (e) => e.stopPropagation() },
        h('h3', null, title),
        hint ? h('p', { className: 'hint' }, hint) : null,
        children,
        h('div', { className: 'mvh-dialog-actions' }, footer)));

      const renderModal = () => {
        if (!modal) return null;
        if (modal.kind === 'create' || modal.kind === 'rename') {
          return modalBox(modal.kind === 'create' ? '新建合集' : '重命名合集',
            '合集只是把作品归到一起，不会复制文件。DSH 发布 MV 时带上合集名，也会直接出现在这里。',
            h('label', { className: 'mvh-field' }, h('span', null, '合集名'),
              h('input', { className: 'mvh-input', value: modal.title || '', autoFocus: true, placeholder: '例如：深夜循环',
                onChange: (e) => setModal({ ...modal, title: e.target.value }) })),
            h('label', { className: 'mvh-field' }, h('span', null, '简介（可选）'),
              h('textarea', { className: 'mvh-input', value: modal.desc || '', placeholder: '一句话说明这个合集',
                onChange: (e) => setModal({ ...modal, desc: e.target.value }) })),
            h(React.Fragment, null,
              h('button', { className: 'mvh-btn', type: 'button', disabled: busy, onClick: () => setModal(null) }, '取消'),
              h('button', { className: 'mvh-btn primary', type: 'button', disabled: busy,
                onClick: () => saveCollection({ id: modal.kind === 'rename' ? modal.id : undefined, title: modal.title, desc: modal.desc }) },
                busy ? '保存中…' : '保存')));
        }
        if (modal.kind === 'delcol') {
          return modalBox('删除合集「' + modal.title + '」？',
            '只删合集本身，里面的 MV 文件和导入的 MV 都保留，可以在「全部作品」里重新收进别的合集。',
            null,
            h(React.Fragment, null,
              h('button', { className: 'mvh-btn', type: 'button', disabled: busy, onClick: () => setModal(null) }, '取消'),
              h('button', { className: 'mvh-btn primary', type: 'button', disabled: busy, onClick: doDeleteCollection }, busy ? '删除中…' : '删除合集')));
        }
        if (modal.kind === 'delmv') {
          return modalBox('删除「' + modal.title + '」？',
            '会从本机删除这份 MV 的文件，无法恢复（内置 MV 不受影响）。',
            null,
            h(React.Fragment, null,
              h('button', { className: 'mvh-btn', type: 'button', disabled: busy, onClick: () => setModal(null) }, '取消'),
              h('button', { className: 'mvh-btn primary', type: 'button', disabled: busy, onClick: doDeleteMv }, busy ? '删除中…' : '删除文件')));
        }
        if (modal.kind === 'import') {
          const up = upload || {};
          const drop = h('div', {
            className: 'mvh-drop' + (modal.drag ? ' drag' : ''),
            onClick: () => fileRef.current && fileRef.current.click(),
            onDragOver: (e) => { e.preventDefault(); setModal({ ...modal, drag: true }); },
            onDragLeave: () => setModal({ ...modal, drag: false }),
            onDrop: (e) => {
              e.preventDefault();
              const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
              if (f) setModal({ ...modal, drag: false, file: f, title: modal.title || f.name.replace(/\.zip$/i, '') });
            },
          },
            h('b', null, modal.file ? modal.file.name : '点这里选一个 zip，或把 zip 拖进来'),
            modal.file ? fmt(modal.file.size) + ' · 入口需要 index.html' : 'MV 项目构建后的压缩包；解压后整份留在本机');
          return modalBox('导入 MV', '导入后出现在「全部作品」，也能直接收进合集。文件只存在本机，不上传别处。',
            drop,
            h('input', { ref: fileRef, type: 'file', accept: '.zip,application/zip', style: { display: 'none' },
              onChange: (e) => {
                const f = e.target.files && e.target.files[0];
                if (f) setModal({ ...modal, file: f, title: modal.title || f.name.replace(/\.zip$/i, '') });
              } }),
            h('label', { className: 'mvh-field' }, h('span', null, '标题'),
              h('input', { className: 'mvh-input', value: modal.title || '', placeholder: '导入后显示的名字',
                onChange: (e) => setModal({ ...modal, title: e.target.value }) })),
            h('label', { className: 'mvh-field' }, h('span', null, '归入合集（可选）'),
              h('select', { className: 'mvh-select', value: modal.collection || '',
                onChange: (e) => setModal({ ...modal, collection: e.target.value }) },
                h('option', { value: '' }, '不归入合集'),
                cols.map((c) => h('option', { key: c.id, value: c.id }, c.title)))),
            up.state === 'uploading' ? h('div', { className: 'mvh-prog' }, h('i', { style: { width: (up.pct || 0) + '%' } })) : null,
            up.state === 'error' ? h('div', { className: 'mvh-err', style: { marginTop: 8 } }, '导入失败：' + up.error) : null,
            h(React.Fragment, null,
              h('button', { className: 'mvh-btn', type: 'button', disabled: up.state === 'uploading', onClick: () => { setModal(null); setUpload(null); } }, '取消'),
              h('button', { className: 'mvh-btn primary', type: 'button', disabled: !modal.file || up.state === 'uploading', onClick: doImport },
                up.state === 'uploading' ? '导入中 ' + (up.pct || 0) + '%' : '导入')));
        }
        if (modal.kind === 'add') {
          const col = cols.find((c) => c.id === modal.id);
          const have = new Set((col ? col.items : []).map((i) => i.key));
          const rows = all.filter((e) => !have.has(e.key));
          return modalBox('往「' + (col ? col.title : '') + '」里添加作品',
            '内置作品和导入 / 发布的 MV 都能收进来；一个作品可以同时在多个合集里。',
            h('div', { className: 'mvh-picks' },
              rows.length ? rows.map((e) => h('label', { className: 'mvh-pick', key: e.key },
                h('input', { type: 'checkbox', checked: !!(modal.keys && modal.keys[e.key]),
                  onChange: (ev) => setModal({ ...modal, keys: { ...(modal.keys || {}), [e.key]: ev.target.checked } }) }),
                e.cover ? h('img', { src: e.cover, alt: '' }) : h('span', { className: 'pick-ph' }),
                h('span', { className: 't' }, e.title,
                  h('small', null, e.kind === 'user' ? '我的' : (e.kind === 'pkg' ? '合集包' : '内置'))))) :
                h('div', { className: 'mvh-empty' }, h('b', null, '没有可添加的作品了'))),
            h(React.Fragment, null,
              h('button', { className: 'mvh-btn', type: 'button', disabled: busy, onClick: () => setModal(null) }, '取消'),
              h('button', { className: 'mvh-btn primary', type: 'button', disabled: busy, onClick: addWorks }, busy ? '添加中…' : '添加所选')));
        }
        return null;
      };

      /* ---------- 页面 ---------- */
      if (!cat) return h('div', { className: 'mvh-root' }, h('div', { className: 'mvh-wrap' }, h('div', { className: 'mvh-loading' }, err ? '加载失败：' + err : '正在加载 MV 合集…')));

      const def = all.find((m) => m.id === (cat.default || 'pdoom')) || builtin[0] || all[0];

      const home = h(React.Fragment, null,
        h('header', { className: 'mvh-head' },
          h('div', null,
            h('div', { className: 'mvh-kicker' }, 'Code Music Video · Collections / v' + cat.version),
            h('h1', { className: 'mvh-title' }, 'MV 合集'),
            h('p', { className: 'mvh-sub' }, '默认内置 P(doom)。自己的 MV 可以导入，也可以让 DSH 直接发布进来；合集只是归档，不复制文件。')),
          h('div', { className: 'mvh-actions' },
            h('button', { className: 'mvh-btn', type: 'button', onClick: () => setModal({ kind: 'create', title: '', desc: '' }) }, I.plus, '新建合集'),
            h('button', { className: 'mvh-btn primary', type: 'button', onClick: () => { setUpload(null); setModal({ kind: 'import', title: '', collection: '', file: null }); } }, I.imp, '导入 MV'))),

        def ? h('section', { className: 'mvh-hero' },
          h('div', { className: 'mvh-hero-art', onClick: () => play(def), role: 'button', tabIndex: 0,
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') play(def); } },
            h('img', { src: def.cover, alt: def.title }),
            h('span', { className: 'mvh-playbig' }, I.play)),
          h('div', { className: 'mvh-hero-body' },
            h('span', { className: 'mvh-badge' }, '默认 MV · 打开先看这一支'),
            h('h2', null, def.title),
            h('div', { className: 'mvh-meta' }, h('span', null, def.en || ''), h('span', null, def.dur || ''), h('span', null, '18 镜')),
            h('p', null, def.desc || ''),
            h('div', { className: 'mvh-row' }, h('button', { className: 'mvh-btn primary', type: 'button', onClick: () => play(def) }, I.play, '立即播放')))) : null,

        h('section', { className: 'mvh-sec' },
          h('div', { className: 'mvh-sec-head' },
            h('div', null,
              h('h3', null, '我的合集'),
              h('p', { className: 'mvh-sec-sub' }, '自己建的合集；DSH 发布 MV 时带上合集名也会出现在这里。')),
            h('button', { className: 'mvh-btn', type: 'button', onClick: () => setModal({ kind: 'create', title: '', desc: '' }) }, I.plus, '新建')),
          h('div', { className: 'mvh-coll-grid' },
            cols.map(collectionCard),
            h('button', { className: 'mvh-coll new', type: 'button', onClick: () => setModal({ kind: 'create', title: '', desc: '' }) },
              h('span', { className: 'plus' }, I.plus),
              h('b', null, '新建合集'),
              h('small', null, '把喜欢的 MV 归到一起')))),

        h('section', { className: 'mvh-sec' },
          h('div', { className: 'mvh-sec-head' },
            h('div', null,
              h('h3', null, '合集扩展'),
              h('p', { className: 'mvh-sec-sub' }, '只显示封面；点一下开始下载，下载完就能播，不用重新打开页面。'))),
          ['ai', 'science', 'letters', 'execute'].map(pkgBar)),

        h('section', { className: 'mvh-sec', style: { marginTop: 24 } },
          h('div', { className: 'mvh-sec-head' },
            h('div', null,
              h('h3', null, '全部作品'),
              h('p', { className: 'mvh-sec-sub' }, builtin.length + ' 支内置 / 合集包作品 + ' + lib.length + ' 支我的（导入或发布）'))),
          h('div', { className: 'mvh-grid' },
            all.map((e) => e.kind === 'user'
              ? h('div', { className: 'mvh-item', key: e.key }, playCard(e),
                h('button', { className: 'mvh-rm', type: 'button', title: '删除这份 MV',
                  onClick: (ev) => { ev.stopPropagation(); setModal({ kind: 'delmv', id: e.id, title: e.title }); } }, '×'))
              : playCard(e)))));

      const detail = current ? h('section', { className: 'mvh-sec' },
        h('div', { className: 'mvh-detail-head' },
          h('button', { className: 'mvh-btn', type: 'button', onClick: () => setView(null) }, I.back, '返回'),
          h('div', { className: 'grow' },
            h('h3', { style: { margin: '0 0 3px', fontSize: 20 } }, current.title),
            h('div', { className: 'mvh-meta' },
              h('span', null, current.count + ' 支作品'),
              current.desc ? h('span', null, current.desc) : null)),
          h('div', { className: 'mvh-actions' },
            h('button', { className: 'mvh-btn primary', type: 'button', onClick: () => setModal({ kind: 'add', id: current.id, keys: {} }) }, I.plus, '添加作品'),
            h('button', { className: 'mvh-btn', type: 'button', onClick: () => setModal({ kind: 'rename', id: current.id, title: current.title, desc: current.desc }) }, '重命名'),
            h('button', { className: 'mvh-btn', type: 'button', onClick: () => setModal({ kind: 'delcol', id: current.id, title: current.title }) }, I.trash, '删除合集'))),
        current.items.length
          ? h('div', { className: 'mvh-grid' }, current.items.map((e) => h('div', { className: 'mvh-item', key: e.key },
            playCard(e),
            h('button', { className: 'mvh-rm', type: 'button', title: '移出合集',
              onClick: (ev) => { ev.stopPropagation(); removeItem(e.key); } }, '×'))))
          : h('div', { className: 'mvh-empty' },
            h('b', null, '这个合集还是空的'),
            '点「添加作品」把内置作品或导入的 MV 收进来；也可以在「导入 MV」时直接归入这个合集。DSH 发布时带上合集名也会出现在这里。')) : null;

      return h('div', { className: 'mvh-root', ref: rootRef },
        h('style', null, CSS),
        h('div', { className: 'mvh-wrap' }, current ? detail : home),
        modal ? renderModal() : null,
        toast ? h('div', { className: 'mvh-toast' }, toast) : null,
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
        h('iframe', { src: info.src + (info.src.includes('?') ? '&' : '?') + 'embed=1', allow: 'autoplay; fullscreen; encrypted-media', title: info.title }));
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
