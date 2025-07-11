/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true,
  skipWaiting: true,
  swSrc: "public/custom-sw.js", // <-- add your custom SW with push logic here

});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "paarshedu.com", // moved from 'domains'
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  serverExternalPackages: ['sharp'], // updated from deprecated experimental field
  experimental: {
  esmExternals: true, // Allow ESM modules with top-level await
},

});

module.exports = nextConfig;
