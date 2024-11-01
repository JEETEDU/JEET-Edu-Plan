import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetUno,
    presetWebFonts
} from 'unocss'

export default defineConfig({
    // theme: {},
    shortcuts: {
        "nav":
            "bg-black text-white",
        "nav-item":
            "text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors",
        "custom-input":
            "border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
        "custom-btn":
            "bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 dark:bg-blue-700 dark:hover:bg-blue-800 mt-4",
        "custom-container":
            "flex items-center justify-center bg-gray-200 dark:bg-gray-900 text-black dark:text-white", // 라이트 모드에서 검정색, 다크 모드에서 흰색
        "custom-form":
            "bg-white rounded px-8 pt-6 pb-8 mt-4 mb-4 max-w-md mx-auto text-black dark:bg-gray-800 dark:text-white", // 라이트 모드에서 검정색, 다크 모드에서 흰색
    },

    presets: [
        presetUno(),
        presetWebFonts(),
        presetAttributify(),
        presetIcons({
            scale: 1.2, // 아이콘 크기
            warn: true, // 잘못된 아이콘 이름 경고
            collections: {
                heroicons: () => import('@iconify-json/heroicons/icons.json').then(i => i.default),
                heroicons_solid: () => import('@iconify-json/heroicons-solid/icons.json').then(i => i.default),
            }
        })
        // ...
    ]
})