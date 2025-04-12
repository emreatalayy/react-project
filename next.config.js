/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML dışa aktarma için
  images: {
    unoptimized: true, // Netlify için gerekli
  },
  trailingSlash: true,
  // Eğer GitHub Pages kullanacaksanız ve repo adınız farklıysa:
  // basePath: '/repo-name',
}

module.exports = nextConfig 