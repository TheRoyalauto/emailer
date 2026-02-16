import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    serverExternalPackages: [
        '@remotion/renderer',
        '@remotion/bundler',
        '@remotion/cli',
    ],
    webpack: (config, { isServer }) => {
        // Prevent Remotion server-only modules from being bundled client-side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
                child_process: false,
            };
        }
        return config;
    },
};

export default nextConfig;
