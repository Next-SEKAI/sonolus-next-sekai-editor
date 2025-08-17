/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.vue', './src/**/*.ts'],
    theme: {
        extend: {
            colors: {
                fg: '#444466',
                bg: '#404464',
                button: '#fff',
                accent: '#77efdc',
                header: '#bcbcd1',
                modal: '#e9ebef',
            },
            width: {
                screen: ['100vw', '100dvw'],
            },
            height: {
                screen: ['100vh', '100dvh'],
            },
        },
    },
}
