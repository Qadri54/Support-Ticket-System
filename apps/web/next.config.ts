import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Monorepo: pin the workspace root so Turbopack doesn't infer it from
  // the nearest lockfile.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
