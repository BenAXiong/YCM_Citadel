import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["better-sqlite3"],
    experimental: {
        outputFileTracingIncludes: {
            "/*": ["../export/**/*"],
        },
    },
};

export default nextConfig;
