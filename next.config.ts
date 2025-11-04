import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // Note: allowedDevOrigins will be available in a future Next.js version
  // For now, the warning can be safely ignored in development
  // Always access the app via http://localhost:3000 (not 127.0.0.1)
};

export default nextConfig;
