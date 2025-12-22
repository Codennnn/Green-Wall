中文 | [English](./README.md)

# [Green Wall](https://green-wall.leoku.dev/)

_为你的 GitHub 贡献拍张快照 📸，然后分享出去！_

**Green Wall** 是一个强大的 Web 工具，帮你更轻松地回顾自己在 GitHub :octocat: 上多年来的贡献记录。它可以把你的贡献数据生成一张图片，方便保存与分享。

[![Screenshot](./screenshot.webp)](https://green-wall.leoku.dev/)

> **演示站点可用性（Netlify Free 计划）**  
> 当 Netlify Free 计划的月度额度（带宽 / 请求 / Functions）用尽时，公开演示站点可能会**暂时不可用**。遇到这种情况不是你的问题——建议使用**自部署**（推荐：Vercel 一键部署）继续使用服务。

## 工作原理

本项目通过 GitHub GraphQL API 拉取数据，并使用 Next.js API Routes 处理请求。想了解我们如何处理你的数据，可以从[这个文件](./src/app/api/contribution/%5Busername%5D/route.ts)开始阅读。

## 使用方法

如果你想在自己的 GitHub README 或网站中展示贡献墙的实时预览，可以参考下面的示例。

**可选参数**

| 参数     | 说明             | 类型     | 默认值    | 示例            |
| -------- | ---------------- | -------- | --------- | --------------- |
| `year`   | 指定要展示的年份 | `number` | 最新年份  | `?year=2023`    |
| `theme`  | 选择图片配色主题 | `string` | `Classic` | `?theme=Violet` |
| `width`  | 自定义图片宽度   | `number` | 1200      | `?width=800`    |
| `height` | 自定义图片高度   | `number` | 630       | `?height=400`   |

**HTML**

```html
<img
  src="https://green-wall.leoku.dev/api/og/share/[YOUR_USERNAME]"
  alt="My contributions"
/>
```

**Markdown**

```markdown
![](https://green-wall.leoku.dev/api/og/share/[YOUR_USERNAME])
```

效果会类似下图所示：

![](https://green-wall.leoku.dev/api/og/share/Codennnn)

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCodennnn%2FGreen-Wall&project-name=green-wall&repository-name=green-wall&env=GITHUB_ACCESS_TOKEN&envDescription=Required%3A%20GITHUB_ACCESS_TOKEN%20to%20call%20the%20GitHub%20GraphQL%20API.&envLink=https%3A%2F%2Fgithub.com%2FCodennnn%2FGreen-Wall%2Fblob%2Fmain%2F.env.example)

本项目是一个 Next.js 应用，会通过 GitHub GraphQL API 拉取数据。最省心的部署方式是使用 Vercel（Next.js 背后的平台）。

> **当演示站点不可用时**  
> 使用 Vercel 一键部署通常是恢复可用性的最快方式。你会得到一个稳定的专属访问地址，并绕开公开演示站点在免费额度上的限制。

> **国内网络提示**  
> 在部分网络环境下，访问 GitHub / Vercel 可能会不稳定：如果你遇到授权登录失败、拉取仓库/依赖超时等问题，建议切换网络或配置代理后再重试部署流程。

### 分步操作

1. **点击 “Deploy with Vercel”**

   - 登录 Vercel，并在提示时授权 GitHub。
   - （推荐）如果你准备做二次定制，请先 Fork 本仓库，再从自己的 Fork 进行部署。

2. **获取 GitHub Personal Access Token（PAT）**

   - 参考 GitHub 官方文档创建 Token：[Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
   - Token 类型：
     - **Fine-grained token**：权限控制更细，推荐（按你的需求选择最小必要权限）。
     - **Classic token**：同样可用。
   - 权限 / scopes：
     - 建议从最小权限开始。很多场景下，`read:org`（组织相关数据）与 `repo`（需要统计私有贡献时）就足够。
   - **不要把 Token 提交到仓库**。请像密码一样妥善保管。

3. **在 Vercel 配置环境变量**
   - 在导入时（或之后通过 **Project → Settings → Environment Variables**），设置以下变量（完整说明见 [`.env.example`](./.env.example)）：

| 变量                  | 必填 | 说明                                              | 推荐值                           |
| --------------------- | ---- | ------------------------------------------------- | -------------------------------- |
| `GITHUB_ACCESS_TOKEN` | 是   | 服务端调用 GitHub GraphQL API 所需的 GitHub Token | 你的 PAT                         |
| `AI_BASE_URL`         | 否   | OpenAI-compatible API 的 Base URL                 | e.g. `https://api.openai.com/v1` |
| `AI_API_KEY`          | 否\* | AI 服务的 API Key                                 | Provider key                     |
| `AI_MODEL`            | 否   | 该 AI 服务支持的模型名称                          | e.g. `gpt-4o-mini`               |

> 说明：AI 相关变量仅用于 **AI 年度总结** 功能（`/api/ai/yearly-report`）。如果你设置了 `AI_API_KEY`，也请确保 `AI_BASE_URL` 与 `AI_MODEL` 配置正确可用。

4. **部署**
   - 点击 **Deploy** 并等待 Vercel 完成构建。
   - 首次部署完成后，你对 GitHub 仓库的每次推送都会自动触发重新部署。

### 部署后验证

1. 打开你的 Vercel 部署地址，并搜索一个 GitHub 用户名。
2. 确认可以加载多个年份的贡献图。
3. 在浏览器中访问 API：
   - `/api/contribution/<username>` 应该返回 JSON（且不应出现 `Bad credentials`）。
4. 测试分享图片接口：
   - `/api/og/share/<username>` 应该返回一张图片。

## Tampermonkey

我们还提供了一个 [Tampermonkey script](https://greasyfork.org/en/scripts/492478-greenwall-view-all-contribution-graphs-in-github)，让你可以在任意人的 GitHub 个人主页上查看「贡献墙」。脚本会在 GitHub 个人主页增加一个按钮，点击后会显示该用户多年贡献图的聚合视图。

脚本源码位于 [`/plugins/script.ts`](./plugins/script.ts)。

https://github.com/user-attachments/assets/694a5653-348b-4bec-9736-21e777e3ede8

## 本地运行

本项目会使用 [GitHub API](https://docs.github.com/en/graphql) 拉取数据，因此你需要一个用于鉴权的 personal access token。获取方式请参考「[Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)」。

拿到 token 后，在项目根目录新建 `.env.local` 文件，并按如下格式写入：

```sh
# .env.local

# The format should be: GITHUB_ACCESS_TOKEN="[YOUR_TOKEN]"

# Example:
GITHUB_ACCESS_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

随后运行 `pnpm dev` 即可开始本地开发。
