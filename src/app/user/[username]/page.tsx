import type { Metadata } from 'next'

import { DataProvider } from '~/DataContext'

import { UserPage } from './UserPage'

type GenerateMetadata = (params: { params: { username: string } }) => Metadata

export const generateMetadata: GenerateMetadata = ({ params }) => {
  const username = params.username
  const title = `${username}'s GitHub contributions`
  const description = `${username}'s GitHub contributions.`
  const sharingURL = `https://green-wall.vercel.app/share/${username}`
  const image = `https://green-wall.vercel.app/api/og/share/${username}`

  return {
    title: `${username}'s GitHub contributions in review · Green Wall`,
    openGraph: {
      title,
      description,
      url: sharingURL,
      images: image,
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: image,
    },
  }
}

export default function Page() {
  return (
    <DataProvider key="share">
      <UserPage />
    </DataProvider>
  )
}
