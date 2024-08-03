# [Green Wall](https://green-wall.leoku.dev/)

_Take a snapshot 📸 of your GitHub contributions, then share it!_

**Green Wall** is a powerful web tool that simplifies the way you review your GitHub :octocat: contributions over time. This tool allows you to generate an image of your contributions, which you can save and share with others.

<a href="https://green-wall.leoku.dev/">
  <picture>
    <source media="(prefers-color-scheme: )" srcset="./screenshot.png">
    <source media="(prefers-color-scheme: dark)" srcset="./screenshot-dark.png">
    <img alt="Green Wall Screenshot" src="./screenshot.png">
  </picture>
</a>

## How it works

This project leverages the GitHub GraphQL API to retrieve data and employs Next.js API Routes to handle requests. For insights into how we manage your data, refer to [this file](./src/pages/api/contribution/%5Busername%5D.ts).

## Usage

To showcase a live preview of your contributions on your GitHub README or website, you can use the following examples.

**HTML**

```html
<img src="https://green-wall.leoku.dev/api/og/share/[YOUR USERNAME]" alt="My contributions" />
```

**Markdown**

```markdown
![](https://green-wall.leoku.dev/api/og/share/[YOUR USERNAME])
```

This will produce a preview similar to the one shown below.

![](https://green-wall.leoku.dev/api/og/share/Codennnn)

## Tampermonkey

We also offer a [Tampermonkey script](https://greasyfork.org/en/scripts/492478-greenwall-view-all-contribution-graphs-in-github) that enables you to view the 'Green Wall' on anyone's GitHub profile page. The script adds a button to the user's GitHub Profile page, and clicking it will display the user's contribution graphs over the years.

https://github.com/user-attachments/assets/694a5653-348b-4bec-9736-21e777e3ede8

## Credits

- _Inspired by:_ [GitHub Contributions Chart Generator](https://github.com/sallar/github-contributions-chart).
- _Framework:_ Next.js.
- _Font:_ [Rubik](https://fonts.google.com/specimen/Rubik) by Google Fonts.
- _Icons:_ [heroicons](https://heroicons.com).

## Running Locally

To run this project, which uses the [GitHub API](https://docs.github.com/en/graphql) to fetch data, you'll need a personal access token for authentication. For details on obtaining this token, see "[Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)."

Once you have your personal access token, create a file named `.env.local` at the root of the project and insert the token as follows:

```sh
# .env.local

# The format should be: GITHUB_ACCESS_TOKEN="[YOUR TOKEN]"

# Example:
GITHUB_ACCESS_TOKEN="ghp_eQ81YcyFcwVjdJwBgUj150VPnxBf1N48Sep7"
```

Then you are ready to run `pnpm dev` to develop.
