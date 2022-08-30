import { load } from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'

import type { GraphData, RemoteData } from '../../types'

async function fetchYears(username: string): Promise<{ text: string }[]> {
  const data = await fetch(`https://github.com/${username}`)
  const $ = load(await data.text())
  return $('.js-year-link')
    .get()
    .map((a) => ({
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
    const years = await fetchYears(username)
    console.log(years)
    const data = await Promise.all(years.map((year) => fetchDataForYear(username, year.text)))
    const graphData: GraphData = { username: data[0].username, data }

    res.status(200).json(graphData)
  }
}
