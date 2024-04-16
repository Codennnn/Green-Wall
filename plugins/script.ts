function createDialog(): { dialog: HTMLDialogElement } {
  const dialog = document.createElement('dialog')
  dialog.id = 'green-wall-dialog'
  dialog.classList.add(
    'Overlay',
    'Overlay-whenNarrow',
    'Overlay--size-medium-portrait',
    'Overlay--motion-scaleFadeOverlay',
    'Overlay-whenNarrow',
    'Overlay--size-medium-portrait',
    'Overlay--motion-scaleFade'
  )

  const dialogHeader = document.createElement('div')
  dialogHeader.classList.add('Overlay-header')

  const contentWrap = document.createElement('div')
  contentWrap.classList.add('Overlay-headerContentWrap')

  const titleWrap = document.createElement('div')
  titleWrap.classList.add('Overlay-titleWrap')

  const title = document.createElement('h1')
  title.classList.add('Overlay-title')
  title.textContent = 'All Green'

  const actionWrap = document.createElement('div')
  actionWrap.classList.add('Overlay-actionWrap')

  const actionButton = document.createElement('button')
  actionButton.classList.add('close-button', 'Overlay-closeButton')
  actionButton.setAttribute('type', 'button')
  actionButton.innerHTML = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
  </svg>
  `
  actionButton.addEventListener('click', () => {
    dialog.close()
  })

  const dialogBody = document.createElement('div')
  dialogBody.classList.add('Overlay-body')

  titleWrap.append(title)
  actionWrap.append(actionButton)
  contentWrap.append(titleWrap)
  contentWrap.append(actionWrap)
  dialogHeader.append(contentWrap)
  dialog.append(dialogHeader)
  dialog.append(dialogBody)
  document.body.append(dialog)

  return { dialog }
}

const attachTarget = document.querySelector('.Layout-sidebar .h-card .js-profile-editable-replace')
const refNode = document.getElementsByClassName('border-top color-border-muted')[0]

if (attachTarget instanceof HTMLElement) {
  const username = document
    .querySelector('meta[property="profile:username"]')
    ?.getAttribute('content')

  if (username) {
    const block = document.createElement('div')
    block.classList.add(
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

    block.appendChild(title)
    block.appendChild(button)

    attachTarget.insertBefore(block, refNode)

    const { dialog } = createDialog()

    button.addEventListener('click', () => {
      // window.open(`https://green-wall.leoku.dev/share/${username}`, '_blank');
      dialog.showModal()
    })
  }
}
