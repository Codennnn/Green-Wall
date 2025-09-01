// eslint-disable-next-line no-unused-labels
javascript: (function () {
  const usernameBlock = document.querySelector('h1.vcard-names .vcard-username')

  if (usernameBlock instanceof HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const username = usernameBlock.textContent?.trim()

    if (username) {
      window.open(`https://green-wall.leoku.dev/share/${username}`, '_blank')
    }
  }
})()
