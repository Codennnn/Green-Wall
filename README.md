# [Green Wall](https://green-wall.leoku.dev/)

_Take a picture 📸 of your GitHub contributions, then share it!_

**Green Wall** is a powerful web tool designed to help you easily review your GitHub :octocat: contributions over the years. With this tool, you can generate an image of your contributions, which you can save and share with others.

<a href="https://green-wall.leoku.dev/">
  <picture>
    <source media="(prefers-color-scheme: )" srcset="./screenshot.png">
    <source media="(prefers-color-scheme: dark)" srcset="./screenshot-dark.png">
    <img alt="Green Wall Screenshot" src="./screenshot.png">
  </picture>
</a>

## How it works

This project uses the GitHub GraphQL API to fetch data and uses Next.js API Routes to send requests. You can read [this file](./src/pages/api/contribution/%5Busername%5D.ts) to learn how we handle your data.

## Usage 

You can embed a live preview of your contributions into your github README or website by using the below examples.

**HTML**
```html
<img src="https://green-wall.leoku.dev/api/og/share/[YOUR USERNAME]" alt="My contributions">
```

**Markdown**
```markdown
![](https://green-wall.leoku.dev/api/og/share/[YOUR USERNAME])
```

Which would give a preview similar to this.

![](https://green-wall.leoku.dev/api/og/share/Codennnn)

## Tampermonkey

We also provide a [script](https://greasyfork.org/en/scripts/492478-greenwall-view-all-contribution-graphs-in-github) that allows you to view the 'Green Wall' on anyone's GitHub profile page. This script will embed a button in the user's GitHub Profile page, and clicking this button will display the contribution graphs of the current user over the years.

https://github.com/user-attachments/assets/694a5653-348b-4bec-9736-21e777e3ede8

## Credits

- _Inspired by:_ [GitHub Contributions Chart Generator](https://github.com/sallar/github-contributions-chart).
- _Framework:_ Next.js.
- _Font:_ [Rubik](https://fonts.google.com/specimen/Rubik) by Google Fonts.
- _Icons:_ [heroicons](https://heroicons.com).

## Running Locally

This project uses the [GitHub API](https://docs.github.com/en/graphql) to fetch data, so you need a personal access token for authentication. For more information, see "[Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) ."

After creating personal access token, create a file named `.env.local` at the root of the project, then paste the token into it.

```sh
# .env.local

# The format should be: GITHUB_ACCESS_TOKEN="[YOUR TOKEN]"

# Example:
GITHUB_ACCESS_TOKEN="ghp_eQ81YcyFcwVjdJwBgUj150VPnxBf1N48Sep7"
```

Then you are ready to run `pnpm dev` to develop.
