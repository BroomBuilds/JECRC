import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tour frames are content-addressed (rebuild = new commit, same URLs never
  // change mid-deploy) — cache them forever so only the very first visit
  // pays the network cost. Localhost never showed this because disk reads
  // don't need a cache.
  async headers() {
    return [
      {
        source: "/media/tour/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
