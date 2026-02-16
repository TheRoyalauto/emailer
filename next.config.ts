import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    serverExternalPackages: [
        '@remotion/renderer',
        '@remotion/bundler',
        '@remotion/cli',
    ],
};

export default nextConfig;
