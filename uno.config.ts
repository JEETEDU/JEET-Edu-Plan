import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetUno,
    presetWebFonts
} from 'unocss'
import {cn} from "@/app/(main)/components/functions";

export default defineConfig({
    // theme: {},
    shortcuts: {
        "nav":
            cn("w-screen h-fit bg-gray-100 dark:bg-gray-900"),
        "nav-bar":
            cn("h-fit bottom-0 left-0 w-full bg-gray-100 py-2 dark:bg-gray-800 flex justify-around border-t border-gray-300 dark:border-gray-700"),
        "nav-item":
            cn("h-fit px-2 w-full min-w-fit content-center text-gray-700 dark:text-gray-300 lg:hover:text-blue-500 grid place-items-center"),
        "_nav-item":
            cn("h-fit w-full min-w-fit py-1 px-2 rounded flex justify-center"),
        "nav-header":
            cn("h-fit w-full p-4 flex items-center justify-start bg-gray-100 dark:bg-gray-800"),
        "nav-title":
            cn("text-lg font-bold text-blue-600 dark:text-blue-400"),
        "component-input":
            cn("border border-gray-300 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white w-full px-3 py-1 rounded-lg border-gray-300 dark:border-gray-600 focus:(outline-none ring-2 ring-blue-400) bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"),
        "component-button":
            "cursor-pointer bg-blue-500 text-white w-fit py-1 px-3 rounded lg:hover:bg-blue-600 transition duration-200 dark:bg-blue-700 dark:lg:hover:bg-blue-800 text-center bg-blue-500 lg:hover:bg-blue-600 text-white py-1 transition duration-200 items-center flex justify-center",
        "component-button-info":
            cn("text-sm font-medium text-black dark:text-gray-300 mb-1"),
        "component-container":
            cn("flex items-center justify-center bg-gray-200 dark:bg-gray-900 text-black dark:text-white flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900"),
        "component-form":
            cn("w-full bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md"),
        "title-1":
            cn("text-2xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6"),
        "title-2":
            cn("text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-4"),
    },

    presets: [
        presetUno(),
        presetWebFonts(),
        presetAttributify(),
        presetIcons({
            scale: 1.2, // 아이콘 크기
            warn: true, // 잘못된 아이콘 이름 경고
            collections: {
                heroicons: () => import('@iconify-json/heroicons/icons.json', {assert: {type: 'json'}}).then(i => i.default),
                heroicons_solid: () => import('@iconify-json/heroicons-solid/icons.json', {assert: {type: 'json'}}).then(i => i.default),
                system_uicons: () => import('@iconify-json/system-uicons/icons.json', {assert: {type: 'json'}}).then(i => i.default),
            }
        })
        // ...
    ],
})