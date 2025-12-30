'use client'

import Error from 'next/error'

export default function RootNotFoundPage() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  )
}
