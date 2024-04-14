;(function () {
  const leftCard = document.querySelector('.Layout-sidebar .h-card')

  if (leftCard instanceof HTMLElement) {
    const username = document.querySelector('.vcard-username')?.textContent?.trim()

    if (username) {
      const item = document.createElement('div')
      item.classList.add(
        'border-top',
        'color-border-muted',
        'pt-3',
        'mt-3',
        'clearfix',
        'hide-sm',
        'hide-md'
      )

      const title = document.createElement('h2')
      title.classList.add('h4', 'mb-2')
      title.textContent = 'Green Wall'

      const button = document.createElement('button')
      button.classList.add('btn')
      button.textContent = 'View All Green'

      item.appendChild(title)
      item.appendChild(button)

      button.addEventListener('click', () => {
        window.open(`https://green-wall.leoku.dev/share/${username}`, '_blank')
      })

      leftCard.appendChild(item)
    }
  }
})()
