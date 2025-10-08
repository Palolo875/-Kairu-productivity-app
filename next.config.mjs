/** @type {import('next').NextConfig} */
const nextConfig = {
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
    allowedDevOrigins: process.env.REPLIT_DEV_DOMAIN
      ? [
          `https://${process.env.REPLIT_DEV_DOMAIN}`,
          `http://${process.env.REPLIT_DEV_DOMAIN}`,
          process.env.REPLIT_DEV_DOMAIN,
        ]
      : [],
  },
}

export default nextConfig