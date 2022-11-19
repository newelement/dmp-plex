import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    build: {
        manifest: false,
        outDir: 'publishable',
        watch: {
            include: ['resources/assets/**'],
        },
        rollupOptions: {
            input: [
                'resources/assets/js/nowplaying.js',
                'resources/assets/js/plugin.js',
                'resources/assets/sass/plugin.scss',
            ],
            output: {
                assetFileNames: 'assets/css/[name].[ext]',
                entryFileNames: 'assets/js/[name].js',
                chunkFileNames: 'assets/js/[name].js',
            },
        },
    },
    plugins: [
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/assets/js',
            vue: 'vue/dist/vue.esm-bundler.js', // TODO . REMOVE THIS AFTER INTERTIA
        },
    },
});
