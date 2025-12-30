// ==================== Global Initialization ====================
type T = History['replaceState']

function addHistoryEvent(type: 'replaceState'): (...args: Parameters<T>) => ReturnType<T> {
  const originalMethod = window.history[type]

  return function (...args) {
    originalMethod.apply(window.history, args)

    const ev = new Event(type)
    window.dispatchEvent(ev)
  }
}

window.history.replaceState = addHistoryEvent('replaceState')

// ==================== Type Definitions ====================
const enum ContributionLevel {
  Null = 'Null',
  NONE = 'NONE',
  FIRST_QUARTILE = 'FIRST_QUARTILE',
  SECOND_QUARTILE = 'SECOND_QUARTILE',
  THIRD_QUARTILE = 'THIRD_QUARTILE',
  FOURTH_QUARTILE = 'FOURTH_QUARTILE',
}

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface ContributionDay {
  count: number
  date: string
  level: ContributionLevel
  weekday?: Weekday
}

interface ContributionBasic {
  name?: string
  login: string
  avatarUrl: string
  contributionYears: number[]
  contributionCalendars: {
    total: number
    year: number
    weeks: {
      days: ContributionDay[]
    }[]
  }[]
}

interface ValuableStatistics {
  weekendContributions: number
  totalContributions: number
  longestStreak: number
  longestStreakStartDate?: string
  longestStreakEndDate?: string
  longestGap: number
  longestGapStartDate?: string
  longestGapEndDate?: string
  maxContributionsInADay: number
  maxContributionsDate?: string
  averageContributionsPerDay: number
}

interface GraphData extends ContributionBasic {
  statistics?: ValuableStatistics
}

interface Data {
  data: GraphData
}

interface Calendar {
  total: number
  year: number
  rows: ContributionDay[][]
}

interface ProducedData {
  contributionCalendars: Calendar[]
}

// ==================== Constants & Config ====================
const ORIGIN = 'https://green-wall.leoku.dev'

const CONTRIBUTION_LEVEL_MAP: Record<ContributionLevel, number> = {
  [ContributionLevel.Null]: 0,
  [ContributionLevel.NONE]: 0,
  [ContributionLevel.FIRST_QUARTILE]: 1,
  [ContributionLevel.SECOND_QUARTILE]: 2,
  [ContributionLevel.THIRD_QUARTILE]: 3,
  [ContributionLevel.FOURTH_QUARTILE]: 4,
}

const CLOSE_BUTTON_SVG = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
  </svg>
`

const LOADING_SVG = `
  <svg aria-label="Loading" style="box-sizing: content-box; color: var(--color-icon-primary);" width="32" height="32" viewBox="0 0 16 16" fill="none" data-view-component="true" class="anim-rotate">
    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"></circle>
    <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
  </svg>
`

// ==================== Utility Functions ====================
const produceData = ({ data }: Data): ProducedData => {
  const contributionCalendars = data.contributionCalendars.map<Calendar>((cur) => {
    const rows: Calendar['rows'] = [[], [], [], [], [], [], []]
    const nullDay: ContributionDay = { count: 0, date: '', level: ContributionLevel.Null }

    cur.weeks.forEach(({ days }) => {
      if (days.length !== 7) {
        const newDays = [...days]

        for (let i = 0; i <= 6; i++) {
          const theDay = newDays.at(i)
          const weekday = i as Weekday

          if (theDay && typeof theDay.weekday === 'number') {
            if (theDay.weekday === weekday) {
              rows[theDay.weekday].push(theDay)
            }
            else {
              newDays.splice(i, 0, nullDay)
              rows[i].push(nullDay)
            }
          }
          else {
            rows[i].push(nullDay)
          }
        }
      }
      else {
        days.forEach((day) => {
          if (typeof day.weekday === 'number') {
            rows[day.weekday].push(day)
          }
        })
      }
    })

    return {
      total: cur.total,
      year: cur.year,
      rows,
    }
  })

  return {
    contributionCalendars,
  }
}

// ==================== UI Components ====================
const createGraph = (
  params: Calendar,
  isHalloween: boolean,
): {
  graphItem: HTMLDivElement
} => {
  const { year, total, rows } = params

  const table = document.createElement('table')
  table.classList.add('ContributionCalendar-grid')
  table.style.borderSpacing = '3px'
  table.style.overflow = 'hidden'
  table.style.position = 'relative'

  const tbody = document.createElement('tbody')
  const fragment = document.createDocumentFragment()

  rows.forEach((row) => {
    const tr = document.createElement('tr')
    tr.style.height = '10px'

    row.forEach((col, idx) => {
      const td = document.createElement('td')

      if (col.level !== ContributionLevel.Null) {
        const level = CONTRIBUTION_LEVEL_MAP[col.level]

        td.tabIndex = -1
        td.style.width = '10px'
        td.dataset.ix = idx.toString()
        td.dataset.level = level.toString()
        td.dataset.date = col.level
        td.className = 'ContributionCalendar-day'
        td.ariaSelected = 'false'
        td.setAttribute('role', 'gridcell')

        const countText = col.count === 0 ? 'No' : col.count.toString()
        td.title = `${countText} contributions on ${col.date}`
      }

      tr.appendChild(td)
    })

    fragment.appendChild(tr)
  })

  tbody.appendChild(fragment)
  table.appendChild(tbody)

  const graphItem = document.createElement('div')
  const countText = document.createElement('div')
  countText.style.marginBottom = '5px'
  countText.textContent = `${total} contributions in ${year}`
  graphItem.append(countText, table)

  if (isHalloween) {
    graphItem.classList.add('ContributionCalendar')
    graphItem.setAttribute('data-holiday', 'halloween')
  }

  return { graphItem }
}

const createDialog = (params: {
  username: string
}): {
  dialog: HTMLDialogElement
  dialogContent: HTMLDivElement
} => {
  const { username } = params

  const dialog = document.createElement('dialog')
  dialog.id = 'green-wall-dialog'
  dialog.classList.add(
    'Overlay',
    'Overlay-whenNarrow',
    'Overlay--size-medium-portrait',
    'Overlay--motion-scaleFadeOverlay',
    'Overlay-whenNarrow',
    'Overlay--size-medium-portrait',
    'Overlay--motion-scaleFade',
  )
  dialog.style.minWidth = '777px'
  dialog.style.maxHeight = 'calc(100vh - 50px)'

  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-modal')
  })

  let mouseDownTarget: HTMLElement

  const mouseDownHandler = (ev: MouseEvent) => {
    if (ev.target instanceof HTMLElement) {
      mouseDownTarget = ev.target
    }
  }

  const mouseUpHandler = (ev: MouseEvent) => {
    if (
      ev.target instanceof HTMLDialogElement
      && ev.target === mouseDownTarget
      && ev.target === dialog
    ) {
      dialog.close()
    }
  }

  dialog.addEventListener('mousedown', mouseDownHandler)
  dialog.addEventListener('mouseup', mouseUpHandler)

  const wrap = document.createElement('div')
  wrap.style.display = 'flex'
  wrap.style.flexDirection = 'column'
  wrap.style.overflow = 'hidden'

  const dialogHeader = document.createElement('div')
  dialogHeader.classList.add('Overlay-header')

  const contentWrap = document.createElement('div')
  contentWrap.classList.add('Overlay-headerContentWrap')

  const titleWrap = document.createElement('div')
  titleWrap.classList.add('Overlay-titleWrap')

  const title = document.createElement('h1')
  title.classList.add('Overlay-title')
  title.textContent = `${username}'s GreenWall`

  const actionWrap = document.createElement('div')
  actionWrap.classList.add('Overlay-actionWrap')

  const actionButton = document.createElement('button')
  actionButton.classList.add('close-button', 'Overlay-closeButton')
  actionButton.setAttribute('type', 'button')
  actionButton.innerHTML = CLOSE_BUTTON_SVG
  actionButton.addEventListener('click', (ev) => {
    ev.stopPropagation()
    dialog.close()
  })

  const dialogBody = document.createElement('div')
  dialogBody.classList.add('Overlay-body')
  dialogBody.style.overflowY = 'auto'

  const dialogContent = document.createElement('div')
  dialogContent.style.display = 'flex'
  dialogContent.style.flexDirection = 'column'
  dialogContent.style.rowGap = '10px'
  dialogContent.style.alignItems = 'center'
  dialogContent.style.padding = 'var(--stack-padding-normal, 1rem)'

  const dialogFooter = document.createElement('div')
  dialogFooter.classList.add(
    'Overlay-footer',
    'Overlay-footer--alignEnd',
    'Overlay-footer--divided',
  )
  const openExtrnalBtn = document.createElement('button')
  const btnContent = document.createElement('span')
  btnContent.classList.add('Button-label')
  btnContent.textContent = 'Open in Green Wall'
  openExtrnalBtn.classList.add('Button', 'Button--primary', 'Button--medium')
  openExtrnalBtn.addEventListener('click', () => {
    window.open(`${ORIGIN}/user/${username}`, '_blank')
  })

  titleWrap.append(title)
  actionWrap.append(actionButton)
  contentWrap.append(titleWrap, actionWrap)
  openExtrnalBtn.append(btnContent)
  dialogHeader.append(contentWrap)
  dialogBody.append(dialogContent)
  dialogFooter.append(openExtrnalBtn)

  wrap.append(dialogHeader, dialogBody, dialogFooter)
  dialog.append(wrap)

  document.body.append(dialog)

  return { dialog, dialogContent }
}

// ==================== Main Logic ====================
const handler = () => {
  const githubUserPageRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+(?=\/?$)/
  const isProfile = githubUserPageRegex.test(window.location.href)

  if (!isProfile) {
    return
  }

  const profileArea = document.querySelector(
    '.Layout-sidebar .h-card .js-profile-editable-replace',
  )
  const refNode = document.querySelector('.js-profile-editable-replace > .d-flex.flex-column')
    ?.nextSibling?.nextSibling

  if (!(profileArea instanceof HTMLElement && refNode instanceof HTMLElement)) {
    console.warn('[Green Wall]: Target node not found.')

    return
  }

  const username = document
    .querySelector('meta[name="octolytics-dimension-user_login"]')
    ?.getAttribute('content')

  if (!username) {
    return
  }

  const exists = !!document.querySelector('#green-wall-block')

  if (exists) {
    return
  }

  // Create trigger button
  const block = document.createElement('div')
  block.setAttribute('id', 'green-wall-block')
  block.classList.add(
    'border-top',
    'color-border-muted',
    'pt-3',
    'mt-3',
    'clearfix',
    'hide-sm',
    'hide-md',
  )

  const title = document.createElement('h2')
  title.classList.add('h4', 'mb-2')
  title.textContent = 'Green Wall'

  const openBtn = document.createElement('button')
  openBtn.classList.add('btn')
  openBtn.textContent = ' ⬜🟩 View All Green'

  block.appendChild(title)
  block.appendChild(openBtn)

  profileArea.insertBefore(block, refNode)

  // Create dialog
  const { dialog, dialogContent } = createDialog({ username })
  let hasLoaded = false
  let isHalloween = false

  // Error handler
  const handleLoadError = (error: unknown) => {
    dialogContent.innerHTML = ''

    const errorTimestamp = new Date().toISOString()
    let rawErrorMessage = 'Unknown error'
    let errorStack: string | undefined

    if (error instanceof Error) {
      rawErrorMessage = error.message || rawErrorMessage
      errorStack = error.stack
    }
    else if (typeof error === 'string') {
      rawErrorMessage = error
    }
    else if (typeof error === 'object' && error !== null && 'message' in error) {
      const maybeMessage = (error as { message?: unknown }).message

      if (typeof maybeMessage === 'string') {
        rawErrorMessage = maybeMessage
      }
    }

    const singleLineErrorMessage = rawErrorMessage.replace(/\s+/g, ' ').trim()
    const safeErrorMessage
      = singleLineErrorMessage.length > 140
        ? `${singleLineErrorMessage.slice(0, 140)}...`
        : singleLineErrorMessage

    console.error('[Green Wall]: load data failed', {
      timestamp: errorTimestamp,
      message: safeErrorMessage,
      stack: errorStack,
      error,
    })

    const errorBlock = document.createElement('div')
    errorBlock.style.display = 'flex'
    errorBlock.style.flexDirection = 'column'
    errorBlock.style.alignItems = 'center'

    const tip = document.createElement('p')
    tip.textContent = 'The process of obtaining data has an exception.'

    const retryBtn = document.createElement('button')
    retryBtn.classList.add('btn')
    retryBtn.textContent = 'Retry'
    retryBtn.addEventListener('click', () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      handleLoadData()
    })

    errorBlock.append(tip, retryBtn)
    dialogContent.append(errorBlock)
  }

  // Data loader
  const handleLoadData = () => {
    dialogContent.innerHTML = LOADING_SVG

    GM.xmlHttpRequest({
      method: 'GET',
      url: `${ORIGIN}/api/contribution/${username}?statistics=true`,
      onload: (response) => {
        try {
          dialogContent.innerHTML = ''

          const data: Data = JSON.parse(response.responseText) as Data
          const xData = produceData(data)

          // Render contribution calendars
          if (xData.contributionCalendars.length > 0) {
            const contributionCalendarsWrapper = document.createElement('div')

            contributionCalendarsWrapper.classList.add('contribution-calendars-wrapper')
            contributionCalendarsWrapper.style.width = '100%'
            contributionCalendarsWrapper.style.display = 'flex'
            contributionCalendarsWrapper.style.flexDirection = 'column'
            contributionCalendarsWrapper.style.rowGap = '10px'
            contributionCalendarsWrapper.style.alignItems = 'center'
            contributionCalendarsWrapper.style.padding = 'var(--stack-padding-normal, 1rem)'
            contributionCalendarsWrapper.style.borderRadius = 'var(--borderRadius-medium)'
            contributionCalendarsWrapper.style.backgroundColor = 'var(--bgColor-default, var(--color-canvas-default))'

            dialogContent.append(contributionCalendarsWrapper)

            xData.contributionCalendars.forEach((calendar) => {
              const { graphItem } = createGraph(calendar, isHalloween)
              contributionCalendarsWrapper.append(graphItem)
            })
          }

          // Render statistics
          const statistics = data.data.statistics

          if (statistics) {
            const createStatisticItem = (text: string): HTMLParagraphElement => {
              const p = document.createElement('p')
              p.textContent = text

              return p
            }

            const statsItems = [
              createStatisticItem(`最长连续贡献：${statistics.longestStreak} 天（${statistics.longestStreakStartDate ?? 'Unknown'} - ${statistics.longestStreakEndDate ?? 'Unknown'}）`),
              createStatisticItem(`最长间断贡献：${statistics.longestGap} 天（${statistics.longestGapStartDate ?? 'Unknown'} - ${statistics.longestGapEndDate ?? 'Unknown'}）`),
              createStatisticItem(`平均每天贡献：${statistics.averageContributionsPerDay} 次`),
              createStatisticItem(`周末贡献：${statistics.weekendContributions} 次，占 ${((statistics.weekendContributions / statistics.totalContributions) * 100).toFixed(0)}%`),
              createStatisticItem(`最大单日贡献：${statistics.maxContributionsInADay} 次（${statistics.maxContributionsDate ?? 'Unknown'}）`),
            ]

            statsItems.forEach((item) => {
              dialogContent.append(item)
            })
          }

          hasLoaded = true
        }
        catch (err) {
          handleLoadError(err)
        }
      },
      onerror: (err) => {
        handleLoadError(err)
      },
    })
  }

  // Dialog open handler
  const handleDialogOpen = () => {
    dialog.showModal()
    document.body.classList.add('has-modal')

    if (!hasLoaded) {
      isHalloween
        = document.querySelector('.ContributionCalendar')?.getAttribute('data-holiday')
          === 'halloween'

      handleLoadData()
    }
  }

  openBtn.addEventListener('click', () => {
    handleDialogOpen()
  })
}

// ==================== Event Listeners ====================
// In order to ensure that the script is still effective when the page is navigated forward and backward, we need to listen to the replaceState event of history to trigger the script.
window.addEventListener('replaceState', handler)
