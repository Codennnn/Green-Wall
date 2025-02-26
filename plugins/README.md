## 本地开发与调试

### 1. 配置油猴脚本

在油猴脚本编辑器中，使用 `@require` 指令引入本地插件文件：

```javascript
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
// @require            file:///Users/your-path/Green-Wall/plugins/script.js
```

### 2. 开发流程

1. **克隆项目**

   ```bash
   git clone https://github.com/Codennnn/Green-Wall.git
   cd Green-Wall
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **启动开发服务**

   ```bash
   pnpm dev:script
   ```

4. **修改油猴脚本**
   - 将 `@require` 路径指向你的本地项目目录
   - 路径必须使用绝对路径
   - Windows 系统需要使用正斜杠 `/`

### 3. 调试技巧

- 使用浏览器开发者工具 (F12) 查看控制台输出
- 修改代码后刷新页面即可看到效果

### 4. 注意事项

- 确保油猴脚本的 `@match` 规则正确配置
- 本地文件路径区分大小写
- 开发时建议打开浏览器的开发者工具
- 代码变更后需要刷新页面才能看到效果

### 5. 常见问题

1. **脚本无法加载**

   - 检查文件路径是否正确
   - 确认油猴插件权限设置
   - 验证文件是否存在

2. **更改不生效**
   - 确保开发服务器正在运行
   - 检查控制台是否有错误信息
   - 尝试强制刷新页面 (Ctrl + F5)

### 6. 提交代码

1. 创建新的分支
2. 编写更改说明
3. 提交 Pull Request
4. 等待 Review 和合并

如有问题，欢迎提交 Issue 或在讨论区交流。
