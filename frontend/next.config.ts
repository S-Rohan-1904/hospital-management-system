import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Check if we are in a production environment
    const isProd = process.env.NODE_ENV === "production";

    return [
      {
        source: "/api/:path*", // Match any request starting with /api
        destination: isProd
          ? "https://your-production-api.com/api/v1/:path*" // Use the production API in production
          : "http://localhost:8000/api/v1/:path*", // Proxy to localhost in development
      },
    ];
  },
};

export default nextConfig;
