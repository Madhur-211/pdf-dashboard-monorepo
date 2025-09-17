// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don’t block production builds on lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t block production builds on type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
