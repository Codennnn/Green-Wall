import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Prevent the website from being embedded in an iframe.
            key: 'Content-Security-Policy',
            value: 'frame-ancestors \'self\'',
          },
        ],
      },
    ]
  },
}

export default nextConfig
