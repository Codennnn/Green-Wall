import type { Metadata } from 'next'

import { DataProvider } from '~/DataContext'

import { UserPage } from './UserPage'

type GenerateMetadata = (params: { params: Promise<{ username: string }> }) => Promise<Metadata>

export const generateMetadata: GenerateMetadata = async ({ params }): Promise<Metadata> => {
  const { username } = await params
  const title = `${username}'s GitHub contributions`
  const description = `${username}'s GitHub contributions.`
  const sharingURL = `https://green-wall.leoku.dev/share/${username}`
  const image = `https://green-wall.leoku.dev/api/og/share/${username}`

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
