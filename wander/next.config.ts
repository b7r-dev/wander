import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins is only needed in development for LAN HMR access.
  // In production it has no effect. We leave it empty here and set it
  // dynamically in dev via next.config.js if needed.
};

export default nextConfig;
