# MV 合集 · DSH 插件（MV Renderer for DSH）

把 [MV渲染器](https://github.com/xunfe/mv-renderer) 的引擎做成 DSH 网页扩展：

- **内置默认 MV**（P(doom)），打开插件就能播。
- 其余四个合集（AI娘 / 科普简史 / 大肥鱼的情书 / word excuse me）**只显示封面**；第一次播放时从 **Cloudflare R2** 下载合集包，解压到本机后离线播放。
- **自己也能用**：新建合集、导入 MV（zip）、把内置作品收进合集、改名 / 删除。
- **DSH 可以直接输出到插件**：`mv_hub_publish` 把做好的 MV 连封面和画面帧发布进来，用户在页面刷新就能看；
  外部 agent（比如另一台机器上的大肥鱼）可以走 HTTP `POST /mv-hub/api/publish` 直接推。
- 参考接口保留并扩展到用户作品：`mv_hub_source` 读源码（内置 id 或 `u:<id>`）、`mv_hub_frames` 拿画面帧。
- 网页 UI 是 React + 宿主主题 token；只有 MV 画面本身放在同源 iframe 里（画布/WebGL 是作品内容，不是宿主页面）。

## 安装

运行资源（`web/` 默认 MV 站点、`ref/` 源码与画面帧）已经打进发布包，不需要再手动补：

```bash
# 推荐：用打好的软件包一键装
# 在 DSH 里 plugin_manager install_bundle，target 填 tgz 的绝对路径：
#   /sdcard/我的文件/Dsh/mv110/dist/dsh-mv-hub-1.2.1.tgz
# 或命令行：
dsh plugin install /sdcard/我的文件/Dsh/mv110/dist/dsh-mv-hub-1.2.1.tgz
```

从源码目录装（开发时）：

```bash
dsh plugin install /path/to/plugin        # 或 plugin_manager install_bundle 指向本目录
```

装完重启 DSH（Host 代码在启动时加载）。`catalog.json` 里的 R2 地址、大小和 sha256 是 1.1.0 的公开下载地址；
换桶时改这里和 `mv110/tools/pack-r2.py`。

## 页面怎么用

- **新建合集**：右上角「新建合集」，起名 / 填简介；合集只是归档，不复制 MV 文件。
- **导入 MV**：右上角「导入 MV」，选构建好的 zip（入口 `index.html`，允许套一层目录），可顺便归入合集。
- **收作品**：打开合集 →「添加作品」，内置作品、合集包作品、导入 / 发布的 MV 都能勾进来。
- **播放**：点封面。未下载的合集包会先自动下载；导入的 MV 走 `/custom/<id>/`。
- **DSH 发布**：让 DSH 做好后调 `mv_hub_publish`（见下），页面刷新即可看到，和导入的作品一样能播、能读源码和帧。

## 给 DSH 的工具

| 工具 | 作用 |
|---|---|
| `mv_hub_catalog` | 列出内置 MV、合集包状态、我的合集、我的 MV；做 MV 前先调它 |
| `mv_hub_source` | 读某一支 MV 的源码（内置 id 或用户 MV 的 `u:<id>`） |
| `mv_hub_frames` | 拿参考画面帧的绝对路径 |
| `mv_hub_download` | 下载合集包 |
| `mv_hub_publish` | 从目录 / 逐文件直接发布到插件，可带合集、封面、帧 |
| `mv_hub_import` | 导入本机 zip |
| `mv_hub_collections` | 列出 / 新建 / 改名 / 删除合集，加或移出作品 |

发布示例：

```
mv_hub_publish(
  title="河", dir="/sdcard/我的文件/Dsh/某工程/dist",
  collection="我的作品", cover=".../cover.jpg", framesDir=".../frames"
)
```

## HTTP 接口（外部 agent 直接推）

完整请求 / 响应见 [`docs/API.md`](docs/API.md)，运行时也可以直接读 `GET /mv-hub/api/help`。

```bash
# 发布
curl -s http://127.0.0.1:3080/mv-hub/api/publish \
  -H 'Content-Type: application/json' \
  -d '{"collection":{"title":"我的作品"},"mv":{"id":"river","title":"河"},
       "files":[{"path":"index.html","text":"<!doctype html><h1>river</h1>"}]}'

# 导入 zip
curl -s --data-binary @demo.zip -H 'Content-Type: application/zip' \
  'http://127.0.0.1:3080/mv-hub/api/import?name=demo.zip&title=我的%20MV'
```

数据在 `$DSH_HOME/mv-hub/`（可用 `MV_HUB_DIR` 覆盖）：`pkgs/` 放下载包，`user/collections.json` 放合集，
`user/mvs/<id>/` 放导入 / 发布的 MV。接口只在本机监听，没有鉴权，不要把 3080 暴露到公网。

## 目录

| 文件 | 作用 |
|---|---|
| `index.js` | Host：注册 `/mv-hub`、`/custom`、共享播放脚本路由；注册七个工具 |
| `client.js` | Client：`main` 面板 + `sidebar.panellist` 图标；合集、导入、发布后的作品网格、播放器 |
| `catalog.json` | 13 支 MV 的元数据、四个合集包的 R2 地址 |
| `lib/mv-store.cjs` | 用户合集与 MV 的存储、zip 导入、发布、帧 / 封面处理 |
| `lib/mv-api.cjs` | HTTP 路由：目录、源码、帧、合集增删、导入、发布、删除 |
| `lib/mv-dl.cjs` | 无依赖的 Node 下载 / sha256 / zip 解压 |
| `docs/API.md` | 给 DSH 与外部 agent 的接口文档 |
| `ref/code/<id>/` | 每支 MV 的源码（工具读） |
| `ref/frames/<id>/` | 参考画面帧（工具读） |

## 打包成软件包

```bash
cd plugin
npm pack --pack-destination ../dist    # 产出 dsh-mv-hub-1.2.1.tgz（含 web/ 与 ref/）
```

## 许可

AGPL-3.0。MV 的原创与授权信息见各 MV 的 `README.md`；`world.execute (me)` 原曲不随包分发。
