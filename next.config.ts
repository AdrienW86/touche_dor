import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/prototype/assets/interior/studio_small_09_1k.hdr.gz", headers: [
      { key: "Content-Encoding", value: "gzip" },
      { key: "Content-Type", value: "image/vnd.radiance" },
    ] }];
  },
  turbopack: {
    root: __dirname,
  },
};
export default nextConfig;
