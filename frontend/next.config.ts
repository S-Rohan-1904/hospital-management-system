import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match any request starting with /api
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, // Use the API URL from environment variables
      },
    ];
  },
};

export default nextConfig;
