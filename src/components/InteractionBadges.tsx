import { Badge } from '~/components/ui/badge'
import { numberWithCommas } from '~/helpers'
import type { RepoInteraction } from '~/types'

interface InteractionBadgesProps {
  interaction: RepoInteraction['interaction']
  stargazerCount?: number
  forkCount?: number
}

export function InteractionBadges(props: InteractionBadgesProps) {
  const { interaction, stargazerCount, forkCount } = props

  const { commits, pullRequests, reviews, issues } = interaction

  const items = [
    { label: 'Stars', value: stargazerCount, title: 'Stars', priority: 1 },
    { label: 'Fork', value: forkCount, title: 'Forks', priority: 2 },
    { label: 'Commits', value: commits, title: 'Commits', priority: 3 },
    { label: 'PR', value: pullRequests, title: 'Pull Requests', priority: 4 },
    { label: 'Reviews', value: reviews, title: 'Reviews', priority: 5 },
    { label: 'Issues', value: issues, title: 'Issues', priority: 6 },
  ].filter((item) => item.value !== undefined && item.value > 0)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map((item) => {
        if (typeof item.value !== 'number') {
          return null
        }

        const isPriority = item.priority <= 2

        return (
          <Badge
            key={item.label}
            size="sm"
            title={item.title}
            variant={isPriority ? 'default' : 'outline'}
          >
            <span className={isPriority ? '' : 'text-muted-foreground'}>
              {item.label}
            </span>
            <span className="ml-0.5">
              {numberWithCommas(item.value)}
            </span>
          </Badge>
        )
      })}
    </div>
  )
}
