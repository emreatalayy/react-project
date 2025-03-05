/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML dışa aktarma için
  images: {
    unoptimized: true, // Netlify için gerekli
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Eğer GitHub Pages kullanacaksanız ve repo adınız farklıysa:
  // basePath: '/repo-name',
}

module.exports = nextConfig   