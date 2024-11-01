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
            "bg-black text-white"
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