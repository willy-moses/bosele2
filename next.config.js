/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enables static export
  images: {
    unoptimized: true // disables Next.js image optimization (needed for static export)
  }
}

module.exports = nextConfig
