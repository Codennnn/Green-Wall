/* eslint-disable @next/next/no-img-element */
/* eslint react/no-unknown-property: [1, { ignore: ['tw'] }] */
/* eslint "tailwindcss/classnames-order": [1, { classRegex: /tw/ }] */

import { ImageResponse, type NextRequest } from 'next/server'

import { fetchGitHubUser } from '~/services'

export const runtime = 'edge'

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 628

export async function GET(_: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  const user = await fetchGitHubUser(username)

  return new ImageResponse(
    (
      <div tw="flex h-full w-full bg-white p-8 text-3xl text-black">
        <div tw="flex items-center">
          <img
            src={user.avatarUrl}
            tw="mb-4 h-16 w-16 overflow-hidden rounded-full object-cover object-center shadow-2xl"
          />
          <div tw="ml-4 flex flex-col">
            <div tw="text-6xl">{user.name}</div>
            <div tw="mb-2 flex text-3xl opacity-60">github.com/{user.login}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
    }
  )
}
