/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML dışa aktarma için
  images: {
    unoptimized: true, // Netlify için gerekli
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLint hatalarını build sırasında yok say
  },
  trailingSlash: true,

}

module.exports = nextConfig 