import type { Metadata } from 'next'

import { DataProvider } from '~/DataContext'

import { SharePage } from './SharePage'

type GenerateMetadata = (params: { params: { username: string } }) => Metadata

export const generateMetadata: GenerateMetadata = ({ params }) => {
  const username = params.username
  const sharingTitle = `${username}'s GitHub contributions`
  const sharingDescription = `I just made a GitHub contributions graph in review!`
  const sharingURL = `https://green-wall.vercel.app/share/${username}`
  const image = `https://green-wall.vercel.app/api/og/share/${username}`

  return {
    title: `${username}'s GitHub contributions in review · Green Wall`,
    openGraph: {
      title: sharingTitle,
      description: sharingDescription,
      url: sharingURL,
      images: image,
    },
  }
}

export default function Page() {
  return (
    <DataProvider key="share">
      <SharePage />
    </DataProvider>
  )
}
