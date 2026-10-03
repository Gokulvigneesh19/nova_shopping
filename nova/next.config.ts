import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // The shop listing now lives on the home page; product pages stay at /shop/:id.
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;