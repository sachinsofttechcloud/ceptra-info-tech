import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.1.111'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ceptrainfotech.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;
