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
                "primary": "#1DB5B5",
                "primary-dark": "#168f8f",
                "primary-light": "#E8F8F8",
                "background-light": "#f8fafc",
                "background-dark": "#101322",
                "surface-light": "#ffffff",
                "surface-dark": "#1a1d2d",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(29, 181, 181, 0.3)',
            }
        },
    },
    plugins: [],
}
