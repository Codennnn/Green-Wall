/** @type {import('next').NextConfig} */

export default {
  experimental: {
    reactCompiler: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Prevent the website from being embedded in an iframe.
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ]
  },
}
