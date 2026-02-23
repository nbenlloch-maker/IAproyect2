/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FDFBF7',
                parchment: '#F5EFE0',
                fog: '#EDE7D9',
                charcoal: '#2D2D2D',
                ink: '#1A1A2E',
                amber: '#C8933A',
                'amber-light': '#E8B86D',
                sage: '#6B8F71',
                'sage-light': '#A8C5AC',
                mist: '#8A9BB5',
                rust: '#8B4513',
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                hand: ['Caveat', 'cursive'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'leather': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%231a1208'/%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23221a0e' opacity='0.5'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'notebook': '2px 4px 24px rgba(0,0,0,0.18), -1px 0 8px rgba(0,0,0,0.08)',
                'note': '0 2px 10px rgba(107,143,113,0.15)',
                'lock': '0 20px 60px rgba(0,0,0,0.5)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease forwards',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
                'slide-right': 'slideRight 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                slideRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
                pulseSoft: { '0%,100%': { opacity: 0.7 }, '50%': { opacity: 1 } },
            },
        },
    },
    plugins: [],
};
