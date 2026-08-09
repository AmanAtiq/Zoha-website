/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Book covers / hero art are locally hosted brand assets
    unoptimized: false,
  },
};

module.exports = nextConfig;
