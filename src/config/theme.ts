/**
 * ============================================
 * E-MAILER THEME CONFIGURATION
 * ============================================
 * 
 * Central source of truth for all design tokens.
 * Change fonts, colors, or spacing here and it
 * propagates app-wide automatically.
 * 
 * USAGE: Import and use in components/pages:
 *   import { theme, fonts } from '@/config/theme';
 * 
 */

// ============================================
// TYPOGRAPHY
// ============================================

export const fonts = {
    // Primary font for all body text
    primary: "'Plus Jakarta Sans', system-ui, sans-serif",

    // Display font for headings (can be different for branding)
    display: "'Plus Jakarta Sans', system-ui, sans-serif",

    // Monospace for code, data, technical content
    mono: "'JetBrains Mono', 'Fira Code', monospace",

    // Weights
    weights: {
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
// COLORS
// ============================================

export const colors = {
    // Backgrounds
    bg: {
        primary: '#FFFFFF',
        secondary: '#F8F9FC',
        tertiary: '#F1F3F8',
        elevated: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text
    text: {
        primary: '#1A1D26',
        secondary: '#4B5563',
        muted: '#9CA3AF',
        inverse: '#FFFFFF',
    },

    // Brand / Accent
    accent: {
        primary: '#FF6B4A',      // Electric Coral
        primaryHover: '#FF5533',
        secondary: '#0EA5E9',    // Deep Teal
        secondaryHover: '#0284C7',
    },

    // Gradients (as CSS strings)
    gradients: {
        coral: 'linear-gradient(135deg, #FF6B4A 0%, #F43F5E 100%)',
        teal: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
        subtle: 'linear-gradient(135deg, #F8F9FC 0%, #F1F3F8 100%)',
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
        default: '#E5E7EB',
        subtle: '#F3F4F6',
        focus: '#FF6B4A',
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
    md: 10,
    lg: 14,
    xl: 20,
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
    glow: '0 0 20px rgba(255, 107, 74, 0.15)',
    glowStrong: '0 0 30px rgba(255, 107, 74, 0.25)',
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

// ============================================
// HELPER: Generate CSS custom properties
// ============================================

export function getThemeCSSVariables(): string {
    return `
        --font-primary: ${fonts.primary};
        --font-display: ${fonts.display};
        --font-mono: ${fonts.mono};
        
        --bg-primary: ${colors.bg.primary};
        --bg-secondary: ${colors.bg.secondary};
        --bg-tertiary: ${colors.bg.tertiary};
        
        --text-primary: ${colors.text.primary};
        --text-secondary: ${colors.text.secondary};
        --text-muted: ${colors.text.muted};
        
        --accent-primary: ${colors.accent.primary};
        --accent-secondary: ${colors.accent.secondary};
        
        --border-default: ${colors.border.default};
        --border-subtle: ${colors.border.subtle};
        
        --radius-sm: ${radius.sm}px;
        --radius-md: ${radius.md}px;
        --radius-lg: ${radius.lg}px;
        --radius-xl: ${radius.xl}px;
    `;
}
