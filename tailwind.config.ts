import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['var(--font-heading)', 'system-ui', '-apple-system', 'sans-serif'],
            },
            keyframes: {
                'drift-slow': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
                    '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
                },
                'drift-medium': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(-25px, 25px) scale(1.08)' },
                },
                'drift-fast': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
                    '25%': { transform: 'translate(15px, -15px) scale(1.03) rotate(1deg)' },
                    '75%': { transform: 'translate(-10px, 10px) scale(0.97) rotate(-1deg)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'fadeIn': {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'drift-slow': 'drift-slow 20s ease-in-out infinite',
                'drift-medium': 'drift-medium 15s ease-in-out infinite',
                'drift-fast': 'drift-fast 12s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'fadeIn': 'fadeIn 0.2s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;
