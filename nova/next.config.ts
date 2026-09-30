import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shop listing now lives on the home page; product pages stay at /shop/:id.
  async redirects() {
    return [{ source: "/shop", destination: "/", permanent: false }];
  },
};

export default nextConfig;
