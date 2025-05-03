import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "konva/lib/Canvas": false,
        "konva/lib/DOMMatrix": false,
        "konva/lib/index-node": false,
      };
    }
    return config;
  },
};

export default nextConfig;
