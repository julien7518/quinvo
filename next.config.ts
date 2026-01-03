import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

module.exports = {
  allowedDevOrigins: ["localhost", "10.0.0.*"],
};

export default nextConfig;
