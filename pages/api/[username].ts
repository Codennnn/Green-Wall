import { load } from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import type { GraphData, RemoteData } from '../../types'

async function fetchYears(username: string): Promise<{ text: string }[]> {
  const data = await fetch(`https://github.com/${username}`)
  const $ = load(await data.text())
  const yearsData = $('.js-year-link').get()

  if (!yearsData || yearsData.length <= 0) {
    throw new Error('GitHub User Not Found')
  }

  return yearsData.map((a) => ({
    text: $(a).text().trim(),
  }))
}

async function fetchDataForYear(username: string, year: string): Promise<RemoteData> {
  const data = await fetch(`https://skyline.github.com/${username}/${year}.json`)
  return data.json()
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200,
  })

  if (typeof username === 'string') {
    try {
      const years = await fetchYears(username)
      try {
        const data = await Promise.all(years.map((year) => fetchDataForYear(username, year.text)))
        const graphData: GraphData = { username: data[0].username, data }
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
