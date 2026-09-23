import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright resolves browsers.json/CLI assets from node_modules at
  // runtime; bundling it breaks the standalone PDF export path. The
  // Dockerfile overlays the complete packages (nft tracing drops them).
  serverExternalPackages: ["playwright", "playwright-core"],
  async headers() {
    return [
      {
        source: "/intake/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
