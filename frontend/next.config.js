/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.your-wordpress-domain.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: process.env.WP_GRAPHQL_URL || 'http://localhost:8080/graphql',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
