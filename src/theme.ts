/**
 * TEMI Quest - Design System & Theme
 * Identidade Visual Centralizada
 */

// ============================================
// COLORS
// ============================================
export const colors = {
    // Primary
    primary: '#1DB5B5',
    primaryLight: '#E0F7FA',
    primaryDark: '#17A2A2',

    // Backgrounds
    background: '#F8FAFA',
    surface: '#FFFFFF',
    surfaceDark: '#1E293B',
    backgroundDark: '#0F172A',

    // Text
    textPrimary: '#1A2B2B',
    textSecondary: '#667A7A',
    textMuted: '#94A3B3',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E1E8E8',
    borderLight: '#F1F5F5',
    borderDark: '#334155',

    // Status
    success: '#27AE60',
    successLight: '#D4EDDA',
    error: '#EB5757',
    errorLight: '#FDEDED',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Neutral Scale
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',

    // Accent (for special highlights)
    accent: '#26A69A',
    accentLight: '#B2DFDB',
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
    fontFamily: {
        sans: "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

// ============================================
// SPACING
// ============================================
export const spacing = {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
} as const;

// ============================================
// SHADOWS
// ============================================
export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Primary color shadows
    primary: '0 4px 14px 0 rgba(29, 181, 181, 0.25)',
    primaryLg: '0 10px 25px -3px rgba(29, 181, 181, 0.3)',
} as const;

// ============================================
// TRANSITIONS
// ============================================
export const transitions = {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ============================================
// Z-INDEX
// ============================================
export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
} as const;

// ============================================
// BREAKPOINTS (for reference)
// ============================================
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================
// COMPLETE THEME EXPORT
// ============================================
export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    zIndex,
    breakpoints,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Transitions = typeof transitions;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type Theme = typeof theme;

export default theme;
