/* eslint-disable @next/next/no-img-element */

import { ImageResponse, type NextRequest } from 'next/server'

import { ContributionLevel } from '~/enums'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'

export const runtime = 'edge'

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

const levelColors = {
  [ContributionLevel.Null]: 'transparent',
  [ContributionLevel.NONE]: '#ebedf0',
  [ContributionLevel.FIRST_QUARTILE]: '#9be9a8',
  [ContributionLevel.SECOND_QUARTILE]: '#40c463',
  [ContributionLevel.THIRD_QUARTILE]: '#30a14e',
  [ContributionLevel.FOURTH_QUARTILE]: '#216e39',
}

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const width = searchParams.get('width')
  const height = searchParams.get('height')

  const user = await fetchGitHubUser(username)
  const latestYear = user.contributionYears[0]
  const targetYear = year ? Number(year) : latestYear

  const contribution = await fetchContributionsCollection(username, targetYear)

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col items-center justify-center bg-white p-8 text-3xl text-black">
        <div tw="flex items-center">
          <div tw="mb-4 flex h-24 w-24">
            <svg viewBox="0 0 24 24" width="100%">
              <path
                clipRule="evenodd"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
                fill="currentcolor"
                fillRule="evenodd"
              />
            </svg>
          </div>

          <div tw="mx-6 text-6xl font-bold">·</div>

          <img src={user.avatarUrl} tw="mb-4 h-24 w-24 overflow-hidden rounded-full" />

          <div tw="-mt-6 ml-10 flex flex-col">
            <div tw="text-5xl font-semibold leading-none">{user.name}</div>
            <div tw="mt-1 flex text-3xl leading-none opacity-60">github.com/{user.login}</div>
          </div>
        </div>

        <div tw="mt-20 flex">
          {contribution.weeks.map(({ days }, widx) => (
            <div key={widx} tw="flex flex-col">
              {days.map(({ level }, didx) => (
                <div
                  key={didx}
                  style={{ backgroundColor: levelColors[level] }}
                  tw="m-0.5 h-4 w-4 rounded"
                />
              ))}
            </div>
          ))}
        </div>

        <div tw="mt-4 flex items-center text-xl opacity-80">
          <span>
            {targetYear}: {contribution.total} Contributions
          </span>
        </div>
      </div>
    ),
    {
      width: width ? Number(width) : IMAGE_WIDTH,
      height: height ? Number(height) : IMAGE_HEIGHT,
    }
  )
}
