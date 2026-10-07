import type { NextConfig } from "next";

// Static export: the admin is plain files served by nginx at admin.shipnative.uz; all data
// comes from the API in the browser (no server of its own).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
