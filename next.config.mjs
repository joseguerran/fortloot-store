/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_INTERNAL_URL || 'http://backend:3001'

const nextConfig = {
  output: 'standalone', // For Docker deployment
  skipTrailingSlashRedirect: true,
  generateBuildId: async () => {
    return 'build-id'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Disable static 404 page generation
    appDir: true,
  },
  async rewrites() {
    return [
      // Note: /api/payments/orders/:orderId/proof is handled by the app/api route handler
      // and should NOT be rewritten to the backend
    ]
  },
}

export default nextConfig
