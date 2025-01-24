// /** @type {import('postcss-load-config').Config} */
module.exports = {
    plugins: {
        // tailwindcss: {},
        // autoprefixer: {},
        '@unocss/postcss': {
            content: ['**/*.{html,js,ts,jsx,tsx}'],
        },
    },
};

// export default config;