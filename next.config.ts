import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export', // Required for Hostinger HTML/CSS/JS export
    allowedDevOrigins: ['192.168.1.111'],
    typescript: {
        ignoreBuildErrors: true, // <-- Add this line to bypass the validator crash
    },
    images: {
        unoptimized: true, // Required for static export to bypass Next.js image server
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
