/**
 * ============================================
 * E-MAILER DESIGN SYSTEM — UNIFIED TOKENS
 * ============================================
 *
 * Single source of truth for all design tokens.
 * Aligned with marketing pages (slate/cyan palette).
 *
 * USAGE: Import in components/pages:
 *   import { theme, colors } from '@/config/theme';
 *
 */

// ============================================
// TYPOGRAPHY
// ============================================

export const fonts = {
    // Headings — Space Grotesk (loaded via --font-heading)
    heading: "var(--font-heading), system-ui, -apple-system, sans-serif",

    // Body — Outfit (loaded via --font-body)
    body: "var(--font-body), system-ui, -apple-system, sans-serif",

    // Monospace for code, data, technical content
    mono: "'JetBrains Mono', 'Fira Code', monospace",

    // Weights
    weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Sizes (in px)
    sizes: {
        xs: 11,
        sm: 13,
        base: 15,
        lg: 17,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
        '5xl': 48,
    },
} as const;

// ============================================
// COLORS — Slate/Cyan palette (matches marketing)
// ============================================

export const colors = {
    // Backgrounds
    bg: {
        primary: '#FFFFFF',         // Cards, modals, elevated surfaces
        secondary: '#F8FAFC',       // Page backgrounds (slate-50)
        tertiary: '#F1F5F9',        // Subtle section fills (slate-100)
        elevated: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text
    text: {
        primary: '#0F172A',         // slate-900 — headings, bold content
        secondary: '#64748B',       // slate-500 — body copy, descriptions
        muted: '#94A3B8',           // slate-400 — placeholders, timestamps
        inverse: '#FFFFFF',
    },

    // Brand / Accent
    accent: {
        primary: '#06B6D4',         // cyan-500 — active states, links, highlights
        primaryHover: '#0891B2',    // cyan-600
        primaryLight: '#ECFEFF',    // cyan-50 — active backgrounds
        secondary: '#0F172A',       // slate-900 — primary CTAs
        secondaryHover: '#1E293B',  // slate-800
    },

    // Gradients (as CSS strings)
    gradients: {
        brand: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
        dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        subtle: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    },

    // Semantic
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',

    // Borders
    border: {
        default: '#E2E8F0',         // slate-200
        subtle: '#F1F5F9',          // slate-100
        focus: '#06B6D4',           // cyan-500
    },
} as const;

// ============================================
// SPACING & RADIUS
// ============================================

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

export const radius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
    glow: '0 0 20px rgba(6, 182, 212, 0.15)',
    glowStrong: '0 0 30px rgba(6, 182, 212, 0.25)',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
    fast: '0.15s ease',
    normal: '0.2s ease',
    smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================
// COMBINED THEME OBJECT
// ============================================

export const theme = {
    fonts,
    colors,
    spacing,
    radius,
    shadows,
    transitions,
} as const;

export default theme;
