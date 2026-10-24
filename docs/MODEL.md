# MV 合集插件 · 模型使用指南

这是一份给模型的说明。用户问起 MV、做 MV、把 MV 放进合集、导入 MV 时再读；平时不用。
插件把「代码 MV」当成作品：内置 13 支只读，用户导入或由你发布的 MV 存在本机，合集只是归档（不复制文件）。

## 工具（都在 mv_hub_* 命名空间）

| 工具 | 参数 | 作用 |
|---|---|---|
| `mv_hub_catalog` | 无 | 列出内置 MV、4 个合集包（是否已下载）、用户合集、导入/发布的 MV。**做任何 MV 相关的事之前先调它。** |
| `mv_hub_source` | `id`，可选 `file` | 读某支 MV 的源码。不传 `file` 列文件清单，传相对路径返回文本。内置 id（`world2`/`math`…），用户 MV 用 `u:<id>`。 |
| `mv_hub_frames` | `id` | 返回参考画面帧的本地绝对路径。用 `read_image` 打开看画面。 |
| `mv_hub_download` | `pkg`：`ai`/`science`/`letters`/`execute` | 从 Cloudflare R2 下载合集包（4 MB–229 MB）。只在用户明确要播这些 MV 时调用。 |
| `mv_hub_publish` | 见下 | 把构建好的 MV 直接发布进插件，用户刷新页面即可看到、可播放。 |
| `mv_hub_import` | `zip`，可选 `title`/`collection` | 导入本机 zip（构建后的项目，入口 `index.html`）。 |
| `mv_hub_collections` | `action` + 参数 | 合集管理：`list` / `create` / `rename` / `delete` / `add` / `remove`。 |

### mv_hub_publish 参数

- `title`（必填）：中文标题。
- `id`（可选）：小写英文 / 数字，用作 `/custom/<id>/` 和源码 key；不填自动生成。
- `sub` / `en` / `desc` / `dur`：副标题、英文名、简介、时长（如 `3:12`）。
- `dir`（推荐）：已经构建好的 MV 目录的**绝对路径**，整棵目录复制进插件。目录里必须有 `index.html`。
- `files`：不用 `dir` 时逐文件传，`[{path, text}]` 或 `[{path, base64}]`。
- `cover`：封面图绝对路径（png/jpg/webp）。
- `frames` / `framesDir`：参考画面帧图片路径（最多取 12 张）；没给 `cover` 时第一张帧会当封面。
- `collection`：合集 id **或**合集名（中文名不存在会自动新建）。
- `entry`：入口页，默认 `index.html`。

返回：`u:<id>` 源码 key、播放地址 `/custom/<id>/<entry>`。

## 做一支 MV 的标准流程

1. `mv_hub_catalog` —— 看现有作品、合集、包的状态。
2. 找参考：`mv_hub_frames(id)` 看画面，`mv_hub_source(id)` 看镜头/时间轴/mvkit 用法。
   源码很大，先列文件清单，只读需要的文件；不要一次把整支 MV 的源码全拉进上下文。
3. 在工作区构建：一个目录 + `index.html` + 相对路径资源（`assets/`、`audio/`、`src/`）。
   - 页面要在浏览器里直接跑：Canvas / WebGL / WebAudio 都行，不要依赖构建服务器或外网请求。
   - 资源一律用**相对路径**（`./assets/x.png`）。写成 `/assets/x.png` 这种根路径，导入后会 404；
     唯一例外是插件会自动把 `/mv-return.js`、`/mv-quality.js`、`/mv-start.js`、`/mv-progress.js`、`/rec-ui.js` 指到插件站点。
   - 音频跟项目放一起（mp3/m4a/flac/wav），入口页里相对引用；播放要用户点一下才出声是正常的。
4. 准备封面：可以单独画一张 `cover.jpg/png`，或者从现有帧里挑一张当 `frames/01.jpg`。
5. `mv_hub_publish({ title, dir: "/…/dist", collection: "我的作品", cover: "/…/cover.jpg" })`。
6. 告诉用户：**刷新 MV 合集页面**就能看到；播放地址是 `/custom/<id>/`。
   这一步很重要——插件页面不会自动轮询新作品。

发布成功后，这支 MV 立刻支持：播放、`mv_hub_source id=u:<id>` 读源码、`mv_hub_frames id=u:<id>` 看帧。

## 合集管理

- 建合集：`mv_hub_collections({action:"create", title:"深夜循环", desc:"…"})`。
- 收作品：`{action:"add", id:"<合集id>", mvs:["pdoom","u:<mv>"]}`；`remove` 反过来。
- 改名/删除：`rename` / `delete`。
- 作品 key：内置 MV 用 id（`pdoom`、`world`、`math`…），用户 MV 用 `u:<id>`。
- 删合集只删归档，MV 文件保留；用户 MV 文件本身目前只能用 HTTP `POST /mv-hub/api/mv/delete {"id":"…"}` 删。
- 合集可以同时在页面上被用户手动管理；你改完让用户刷新即可。

## 页面上用户自己能做的（不用你代劳）

- 新建合集、导入 zip（带进度）、添加/移出作品、改名/删除、删除导入的 MV、刷新。
- 所以用户只是让你「把这张 zip 放进去」时，优先用 `mv_hub_import`；他要的是「做成 MV」才走构建 + 发布。

## 给外部 agent 的 HTTP 接口

DSH 默认在本机 `http://127.0.0.1:3080`。`GET /mv-hub/api/help` 是运行时自描述。

- 发布：`POST /mv-hub/api/publish`，JSON：`{collection:{title}, mv:{id,title,…}, files:[{path,text|base64}], cover:{path,base64}, frames:[{base64}]}`。
- 导入 zip：`POST /mv-hub/api/import?name=x.zip&title=…`，body 是 zip 二进制。
- 合集：`POST /mv-hub/api/collection/save|delete|items`。
- 外部请求不接收服务器本地路径，只能传内容。

## 注意

- 不要为了「看看」就 `mv_hub_download` 大包（229 MB），先问用户或让他自己在页面上点。
- 发布是**复制**目录：别把 `node_modules/`、`.git/`、几 GB 的原始素材一起塞进 `dir`，只放构建产物。
- 用户没让你发布时不要发布；发布是对用户可见的副作用操作。
- 数据目录：`$DSH_HOME/mv-hub/user/`；插件页面、工具、HTTP 用的是同一份数据。
- 播放页在 iframe 里，`embed=1` 由插件自动加，不用你拼。
