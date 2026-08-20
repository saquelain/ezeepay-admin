import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f5ecc7e756ed4a679be87a45b10db202.r2.dev",
      },
    ],
  },
};

export default nextConfig;