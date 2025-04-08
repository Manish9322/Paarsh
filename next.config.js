/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: ["paarshedu.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  // Configure body size limit for server actions and API routes
  serverActions: {
    bodySizeLimit: '500mb', // Increase this limit for large uploads
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp'], // For image processing if needed
  },
});

module.exports = nextConfig;