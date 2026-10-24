# MV 合集 · DSH 插件（MV Renderer for DSH）

把 [MV渲染器](https://github.com/xunfe/mv-renderer) 的引擎做成 DSH 网页扩展：

- **只内置默认 MV**（P(doom)），打开插件就能播。
- 其余四个合集（AI娘 / 科普简史 / 大肥鱼的情书 / word excuse me）**只显示封面**；第一次播放时从 **Cloudflare R2** 下载合集包（亚太区域），解压到本机后离线播放。
- 给 DSH 提供四个工具：`mv_hub_catalog` / `mv_hub_source` / `mv_hub_frames` / `mv_hub_download`，可以直接读 13 支 MV 的源码和参考画面。
- 网页 UI 是 React + 宿主主题 token；只有 MV 画面本身放在同源 iframe 里（画布/WebGL 是作品内容，不是宿主页面）。

## 安装

```bash
# 1) 在这个目录补齐运行资源（不进仓库）
cp -r ../mv-renderer/web ./web          # 软件版的默认 MV + 首页资源
python3 tools/genframes.py              # 生成 ref/frames/*.webp（可选，工具用）

# 2) 装进 DSH
# 在 DSH 里用 plugin_manager install_bundle 指向本目录，或：
dsh plugin install .
```

`catalog.json` 里的 R2 地址、大小和 sha256 是 1.1.0 的公开下载地址；换桶时改这里和 `tools/pack-r2.py`。

## 目录

| 文件 | 作用 |
|---|---|
| `index.js` | Host：`/mv-hub` 路由、`/custom/<pkg>` 下载包挂载、四个工具、下载/解压 |
| `client.js` | Client：`main` 面板 + `sidebar.panellist` 图标；封面网格、下载进度、全屏播放器 |
| `catalog.json` | 13 支 MV 的元数据、四个合集包的 R2 地址 |
| `lib/mv-dl.cjs` | 无依赖的 Node 下载 / sha256 / zip 解压（`prepare` 时从软件仓复制） |
| `tools/pack-r2.py` | 把 `work107/web` 打成 `dist/*.zip` + manifest（打包时用，运行时不依赖） |
| `ref/code/<id>/` | 每支 MV 的源码（工具读） |
| `ref/frames/<id>/` | 参考画面帧（工具读；`genframes.py` 生成） |

## 许可

AGPL-3.0。MV 的原创与授权信息见各 MV 的 `README.md`；`world.execute (me)` 原曲不随包分发。
