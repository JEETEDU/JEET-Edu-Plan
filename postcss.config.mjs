/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        // tailwindcss: {},
        // autoprefixer: {},
        '@unocss/postcss': {
            content: ['**/*.{html,js,ts,jsx,tsx}'],
        },
    },
};

export default config;