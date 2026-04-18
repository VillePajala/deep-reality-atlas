import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // In dev, disable all caching so edits are always visible.
  // In production, let the CDN and browser cache normally — the gallery
  // PNGs are 7-8MB each and must be cacheable.
  ...(isDev && {
    headers: async () => [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
    ],
  }),
};

export default nextConfig;
