import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import type { GraphRemoteData, RemoteData, Year } from '../../types'

async function fetchYears(username: string): Promise<Year[]> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'post',
    body: JSON.stringify({
      query: `
        {
          user(login: "${username}") {
            contributionsCollection {
              contributionYears
            }
          }
        }
      `,
    }),
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
  })

  type Json = {
    data: { user: { contributionsCollection: { contributionYears: Year[] } } | null }
    errors?: any[]
  }
  const json: Json = await res.json()

  if (!json.data.user) {
    throw new Error()
  }

  const years = json.data.user.contributionsCollection.contributionYears
  return years
}

async function fetchDataForYear(username: string, year: Year): Promise<RemoteData> {
  const data = await fetch(`https://skyline.github.com/${username}/${year}.json`)
  return data.json()
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query

  if (process.env.NODE_ENV === 'development') {
    await NextCors(req, res, {
      methods: ['GET'],
      origin: '*',
      optionsSuccessStatus: 200,
    })
  }

  if (typeof username === 'string') {
    try {
      const years = await fetchYears(username)
      try {
        const data = await Promise.all(years.map((year) => fetchDataForYear(username, year)))
        const graphData: GraphRemoteData = { username: data[0].username, data }
        res.status(200).json(graphData)
      } catch {
        res.status(500).json({ message: 'Something went wrong. Please try again soon.' })
      }
    } catch {
      res.status(404).json({
        message: 'Can not find the GitHub user. Please make sure the username is correct.',
      })
    }
  }
}
