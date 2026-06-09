/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "futsal.example.com"],
    formats: ["image/avif", "image/webp"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
