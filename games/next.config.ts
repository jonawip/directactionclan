import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const gamesDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Self-contained app: trace from games/ (has its own package-lock)
  outputFileTracingRoot: gamesDir,
  turbopack: {
    root: gamesDir,
  },
  devIndicators: false,
  webpack: (config, { dev }) => {
    // Avoid stale chunk refs on Windows dev (e.g. Cannot find module './611.js')
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
