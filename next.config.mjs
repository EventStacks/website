/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip static optimization for error pages
  experimental: {
    skipTrailingSlashRedirect: true,
  },
  async redirects() {
    return [
      {
        source: '/posts/governance-getting-started',
        destination: '/posts/getting-started-with-governance',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
