## 本地开发与调试

在油猴脚本中，使用 `@require` 指令引入本地插件。

例如：

```
// ==UserScript==
// @name               GreenWall: View all contribution graphs in GitHub ⬜🟩
// @description        View a graph of users' contributions over the years in GitHub.
// @name:zh-CN         GreenWall - 查看历年 GitHub 的贡献图 ⬜🟩
// @description:zh-CN  在 GitHub 中查看用户历年的贡献图。
// @version            1.2.0
// @namespace          https://green-wall.leoku.dev
// @author             LeoKu(https://leoku.dev)
// @match              https://github.com/*
// @run-at             document-start
// @icon               https://green-wall.leoku.dev/favicon.svg
// @grant              GM.xmlHttpRequest
// @homepageURL        https://github.com/Codennnn/Green-Wall
// @license            MIT
// @require            file:///Users/your-project-path/Green-Wall/plugins/script.js
```