/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Primary Brand Colors
                "primary": "#1DB5B5",
                "primary-dark": "#17A2A2",
                "primary-light": "#E0F7FA",

                // Backgrounds
                "background": "#F8FAFA",
                "background-light": "#F8FAFA",
                "background-dark": "#0F172A",
                "surface": "#FFFFFF",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1E293B",

                // Semantic - Text
                "text-primary": "#1A2B2B",
                "text-secondary": "#667A7A",
                "text-muted": "#94A3B3",

                // Semantic - Borders
                "border-light": "#E1E8E8",
                "border-dark": "#334155",

                // Status Colors
                "success": "#27AE60",
                "success-light": "#D4EDDA",
                "error": "#EB5757",
                "error-light": "#FDEDED",
                "warning": "#F59E0B",
                "warning-light": "#FEF3C7",

                // Brand Accent
                "temi": "#1DB5B5",
                "temi-light": "#E0F7FA",
                "accent": "#26A69A",
            },
            fontFamily: {
                "display": ["Inter", "Roboto", "sans-serif"],
                "sans": ["Inter", "Roboto", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
            },
            borderRadius: {
                'DEFAULT': '0.5rem',
                'sm': '0.25rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                'full': '9999px',
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glow': '0 0 15px rgba(29, 181, 181, 0.3)',
                'primary': '0 4px 14px 0 rgba(29, 181, 181, 0.25)',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            }
        },
    },
    plugins: [],
}

