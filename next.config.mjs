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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Previene clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Previene MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Fuerza HTTPS (HSTS)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Controla referrer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Content Security Policy - permite GA, Clarity, y recursos necesarios
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://www.google-analytics.com",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://www.clarity.ms https://region1.google-analytics.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
