import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: '#6366f1',
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#1a1a2e',
                    foreground: '#a1a1aa',
                },
                card: {
                    DEFAULT: '#0f0f1a',
                    foreground: '#ffffff',
                },
                border: '#27272a',
            },
        },
    },
    plugins: [],
};

export default config;
