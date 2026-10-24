# MV 合集插件 · 接口

插件把「作品」和「合集」都当成数据：内置 13 支 MV 只读；用户导入 / 由 DSH 发布的 MV 落在
`$DSH_HOME/mv-hub/user/`，对外统一挂在 `/custom/<id>/` 下。页面、DSH 工具、外部 agent 用的是同一套接口。

服务地址就是 DSH 自己（默认 `http://127.0.0.1:3080`）。所有接口同源、无鉴权；只在
本机 / 已信任的容器网络里使用，不要把 3080 直接暴露到公网。

## 1. 目录与 key

| 内容 | key | 播放地址 |
|---|---|---|
| 内置 MV（P(doom)） | `pdoom` | `/mv-hub/site/index.html?embed=1` |
| 合集包里的 MV | 内置 id，如 `world` | `/custom/<pkg>/<path>` |
| 导入 / 发布的 MV | `u:<id>` | `/custom/<id>/<entry>` |

数据目录（默认 `$DSH_HOME/mv-hub`，可用环境变量 `MV_HUB_DIR` 改）：

```
mv-hub/
  pkgs/<pkg>/              从 R2 下载的合集包
  user/collections.json    [{ id, title, desc, createdAt, items: [key] }]
  user/mvs/<id>/           index.html + 资源 + meta.json + frames/
```

## 2. 读：目录、源码、画面

### `GET /mv-hub/api/catalog`

```json
{
  "version": "1.1.0", "default": "pdoom",
  "packages": { "ai": { "title": "…", "bytes": 228732166 } },
  "installed": { "ai": false },
  "mvs": [ { "id": "pdoom", "title": "…", "pkg": null, "file": "index.html" } ],
  "library": [ { "key": "u:mine", "kind": "user", "id": "mine", "title": "…", "src": "/custom/mine/index.html" } ],
  "collections": [ { "id": "cxxx", "title": "深夜循环", "count": 2, "cover": "/custom/mine/cover.jpg", "items": [ … ] } ]
}
```

### `GET /mv-hub/api/source?id=<key>&file=<相对路径>`

- 不传 `file`：列出源码文件。
- 内置 MV 用 `id=world2`；用户 MV 用 `id=u:mine`（也接受 `key=u:mine`）。

### `GET /mv-hub/api/frames?id=<key>`

返回参考帧的 `file / url / path`（`path` 是宿主机绝对路径，给 `read_image` 这类工具直接读）。
发布时带了 `frames` 的用户 MV 才会有帧。

### `GET /mv-hub/api/help`

运行时自描述：所有接口、请求体、工具名和一条 curl 示例。外部 agent 先读它最省事。

## 3. 写：合集

```http
POST /mv-hub/api/collection/save
{ "title": "深夜循环", "desc": "可选" }          # 新建
{ "id": "cxxx", "title": "新名字" }             # 改名 / 改简介
```

```http
POST /mv-hub/api/collection/items
{ "id": "cxxx", "add": ["pdoom", "u:mine"], "remove": ["world"] }
```

```http
POST /mv-hub/api/collection/delete
{ "id": "cxxx" }
```

删合集只删归档，不删 MV 文件。

## 4. 写：导入 zip

```http
POST /mv-hub/api/import?name=demo.zip&title=我的%20MV&collection=<合集id>
Content-Type: application/zip
<zip 二进制>
```

zip 里要有入口 `index.html`（允许套一层项目目录）。解压后整份留在 `user/mvs/<id>/`，
相对路径资源照常工作；`/mv-return.js`、`/mv-quality.js` 等共享播放脚本会被自动指到插件站点。

导入后返回：

```json
{ "ok": true, "id": "demo", "title": "我的 MV", "url": "/custom/demo/index.html" }
```

## 5. 写：发布（DSH / 外部 agent 直接输出到插件）

```http
POST /mv-hub/api/publish
Content-Type: application/json

{
  "collection": { "title": "我的作品", "desc": "可选" },
  "mv": {
    "id": "river",
    "title": "河",
    "sub": "副标题",
    "en": "RIVER",
    "desc": "一两句简介",
    "dur": "3:12",
    "entry": "index.html"
  },
  "files": [
    { "path": "index.html", "text": "<!doctype html>…" },
    { "path": "assets/tex.png", "base64": "iVBORw0…" }
  ],
  "cover": { "path": "cover.jpg", "base64": "…" },
  "frames": [ { "path": "frames/f01.jpg", "base64": "…" } ]
}
```

- `files[].text` 传文本，`files[].base64` 传二进制；至少要有 `index.html`。
- `cover` / `frames` 也接受 `data:image/jpeg;base64,…` 字符串。
- `collection` 可以是已有合集的 `id`，也可以直接给中文名（不存在就新建）。
- 帧会落进 `user/mvs/<id>/frames/`，第一张自动当封面，`mv_hub_frames` 能读到。

返回：

```json
{ "ok": true, "id": "river", "key": "u:river", "url": "/custom/river/index.html", "collection": "cxxx" }
```

发布完刷新插件页面就能看到；播放器、源码、画面帧都对它生效。

## 6. 写：删除用户 MV

```http
POST /mv-hub/api/mv/delete
{ "id": "river" }
```

## 7. DSH 工具

| 工具 | 作用 |
|---|---|
| `mv_hub_catalog` | 列出内置 / 合集包 / 我的合集 / 我的 MV |
| `mv_hub_source` | 读源码（内置 id 或 `u:<id>`） |
| `mv_hub_frames` | 拿参考帧绝对路径 |
| `mv_hub_download` | 下载合集包 |
| `mv_hub_publish` | 从目录或文件直接发布到插件（可带合集、封面、帧） |
| `mv_hub_import` | 导入本机 zip |
| `mv_hub_collections` | 列出 / 新建 / 改名 / 删除合集，加或移出作品 |

`mv_hub_publish` 的典型用法：先把 MV 构建到工作区某个目录（有 `index.html`），再

```
mv_hub_publish(title="河", dir="/sdcard/我的文件/Dsh/某工程/dist", collection="我的作品",
               cover=".../cover.jpg", framesDir=".../frames")
```

## 8. 从外部发布（另一台机器上的 DSH / 大肥鱼）

DSH 默认只监听本机。要在另一台机器上发布，二选一：

1. 通过同一台手机上运行的 DSH 接口：把上面的 `curl` 指向 `http://<手机IP>:3080`，并确认
   DSH 的监听地址允许局域网访问（默认镜像 / 端口转发即可）。
2. 让对方把构建产物（zip 或目录）放到这台手机能读到的共享路径，再调
   `mv_hub_import(zip=...)` 或 `mv_hub_publish(dir=...)`。

发布接口不接收服务器本地路径（`files` 只能是内容），避免外部请求读写任意文件。
