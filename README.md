[中文][readme-zh] | English

# [Green Wall][site]

_Take a snapshot 📸 of your GitHub contributions, then share it!_

**Green Wall** is a powerful web tool that simplifies the way you review your GitHub :octocat: contributions over time. This tool allows you to generate beautiful contribution images and get AI-powered yearly reports, which you can save and share with others.

|                                 Contribution Wall                                 |                                   Yearly Report                                   |
| :-------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------: |
| [![Screenshot 1][screenshot-wall]][site] | [![Screenshot 2][screenshot-report]][site] |
|            Generate and view contribution graphs across multiple years            |                  AI-powered yearly review with detailed insights                  |

## Features

**Contribution Wall**
Generate and visualize your GitHub contribution graphs across multiple years. Track your coding journey with beautiful, shareable images. Customize themes, sizes, and styles to make your contributions stand out.

**Yearly Report**
Get an AI-powered yearly review of your GitHub contributions. Receive detailed insights and summaries about your coding activity throughout the year, including key statistics and highlights from your development journey.

> **Demo availability (Netlify Free plan)**
> The public demo may be **temporarily unavailable** when the Netlify Free plan monthly quota is exhausted. If you hit this, it's not your fault—please use **self-deploy** (recommended: Vercel one-click) to keep using the service.

## How it works

This project leverages the GitHub GraphQL API to retrieve data and employs Next.js API Routes to handle requests. For insights into how we manage your data, refer to [this file][api-route].

## Usage

To showcase a live preview of your contributions on your GitHub README or website, you can use the following examples.

**Optional Parameters**

| Parameter | Description                      | Type     | Default Value | Example         |
| --------- | -------------------------------- | -------- | ------------- | --------------- |
| `year`    | Specify calendar year to display | `number` | Latest year   | `?year=2023`    |
| `theme`   | Choose color theme for image     | `string` | `Classic`     | `?theme=Violet` |
| `width`   | Set custom image width           | `number` | 1200          | `?width=800`    |
| `height`  | Set custom image height          | `number` | 630           | `?height=400`   |

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

This will produce a preview similar to the one shown below.

![](https://green-wall.leoku.dev/api/og/share/Codennnn)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)][vercel-deploy]

This project is a Next.js app that fetches data from the GitHub GraphQL API. The easiest way to deploy it is Vercel (the platform behind Next.js).

> **When the demo is unavailable**
> Vercel one-click deployment is the fastest way to restore access. You'll get your own stable URL and avoid the public demo's free-tier quota limits.

### Step-by-step

1. **Click "Deploy with Vercel"**

   - Sign in to Vercel and authorize GitHub when prompted.
   - (Recommended) Deploy from your own fork if you plan to customize the code.

2. **Get a GitHub Personal Access Token (PAT)**

   - Follow GitHub's guide: [Creating a personal access token][github-pat]
   - Token type:
     - **Fine-grained token**: recommended for stricter permissions (select the minimal permissions required by your use case).
     - **Classic token**: works as well.
   - Permissions / scopes:
     - Start with minimal scopes. In many cases, `read:org` (for org data) and `repo` (if you need private contributions) are sufficient.
   - **Do not commit the token**. Treat it like a password.

3. **Configure Environment Variables on Vercel**
   - During import (or later in **Project → Settings → Environment Variables**), set the following variables (see [`.env.example`][env-example] for the full reference):

| Variable              | Required | Description                                                    | Suggested value                  |
| --------------------- | -------- | -------------------------------------------------------------- | -------------------------------- |
| `GITHUB_ACCESS_TOKEN` | Yes      | GitHub token used by the server to call the GitHub GraphQL API | Your PAT                         |
| `AI_BASE_URL`         | No       | Base URL of an OpenAI-compatible API endpoint                  | e.g. `https://api.openai.com/v1` |
| `AI_API_KEY`          | No\\*     | API key for the AI provider                                    | Provider key                     |
| `AI_MODEL`            | No       | Model name supported by your provider                          | e.g. `gpt-4o-mini`               |

> Note: AI variables are only needed for the **Yearly AI Report** feature (`/api/ai/yearly-report`). If you set `AI_API_KEY`, make sure `AI_BASE_URL` and `AI_MODEL` are also valid.

4. **Deploy**
   - Click **Deploy** and wait for Vercel to finish building.
   - After the first deploy, any push to your GitHub repo will trigger a new deployment automatically.

### Verify after deployment

1. Open your Vercel deployment URL and search for a GitHub username.
2. Confirm the contributions graph loads for multiple years.
3. Open the API endpoint in your browser:
   - `/api/contribution/<username>` should return JSON (and should not be `Bad credentials`).
4. Test the share image endpoint:
   - `/api/og/share/<username>` should return an image response.

## Tampermonkey

We also offer a [Tampermonkey script][greasyfork] that enables you to view the 'Green Wall' on anyone's GitHub profile page. The script adds a button to the user's GitHub Profile page, and clicking it will display the user's contribution graphs over the years.

The source code for the script is located in the file [`/plugins/script.ts`][tampermonkey-script].

[demo-video]

## Running Locally

To run this project, which uses the [GitHub API][github-api] to fetch data, you'll need a personal access token for authentication. For details on obtaining this token, see "[Creating a personal access token][github-pat]".

Once you have your personal access token, create a file named `.env.local` at the root of the project and insert the token as follows:

```sh
# .env.local

# The format should be: GITHUB_ACCESS_TOKEN="[YOUR_TOKEN]"

# Example:
GITHUB_ACCESS_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Then you are ready to run `pnpm dev` to develop.

## Docker Build

First, create a `.env.local` file in the project's root directory and enter the correct `GITHUB_ACCESS_TOKEN` variable.

Build Docker image：

```shell
docker build -t green-wall .
```

Run the Docker image：

```shell
docker run -d -p 8000:3000 --name green-wall green-wall
```

Last visited address:

```text
http://localhost:8000
```

<!-- Link References -->
[site]: https://green-wall.leoku.dev/
[repo]: https://github.com/Codennnn/Green-Wall
[readme-zh]: ./README.zh.md
[readme-en]: ./README.md
[env-example]: ./.env.example
[api-route]: ./src/app/api/contribution/[username]/route.ts
[tampermonkey-script]: ./plugins/script.ts
[greasyfork]: https://greasyfork.org/en/scripts/492478-greenwall-view-all-contribution-graphs-in-github
[github-pat]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[github-api]: https://docs.github.com/en/graphql
[screenshot-wall]: https://i.imgur.com/nMZPjuS.png
[screenshot-report]: https://i.imgur.com/kx7wF27.png
[demo-video]: https://github.com/user-attachments/assets/694a5653-348b-4bec-9736-21e777e3ede8
[vercel-deploy]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCodennnn%2FGreen-Wall&project-name=green-wall&repository-name=green-wall&env=GITHUB_ACCESS_TOKEN&envDescription=Required%3A%20GITHUB_ACCESS_TOKEN%20to%20call%20the%20GitHub%20GraphQL%20API.&envLink=https%3A%2F%2Fgithub.com%2FCodennnn%2FGreen-Wall%2Fblob%2Fmain%2F.env.example
