import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { ConfigEnv, Plugin, PluginOption, defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const particleWasmPlugin: Plugin | undefined = {
    name: 'particle-wasm',
    apply: (_, env: ConfigEnv) => {
        return env.mode === 'development';
    },
    buildStart: () => {
        const copiedPath = path.join(
            __dirname,
            './node_modules/@particle-network/thresh-sig/wasm/thresh_sig_wasm_bg.wasm' //@particle-network/thresh-sig dir
        );
        const dir = path.join(__dirname, 'node_modules/.vite/wasm');
        const resultPath = path.join(dir, 'thresh_sig_wasm_bg.wasm');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(copiedPath, resultPath);
    },
};

const plugins = (_mode: string): PluginOption[] => {
    return [
        react(),
        tsconfigPaths(),
        svgr(),
        checker({
            typescript: { tsconfigPath: 'tsconfig.json' },
        }),
        eslint({
            failOnError: true,
            failOnWarning: true,
            emitError: true,
            emitWarning: true,
            useEslintrc: true,
        }),
        particleWasmPlugin,
        nodePolyfills({
            // Whether to polyfill `Buffer` (true by default)
            include: ['buffer'],
        }),
    ];
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        // depending on your application, base can also be "/"
        define: {
            'process.env': env,
        },
        plugins: plugins(mode),
        server: {
            // this ensures that the browser opens upon server start
            open: true,
            // this sets a default port to 3000
            port: 3000,
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        rainbowkit: ['@rainbow-me/rainbowkit'],
                        lottie: ['lottie-react'],
                        router: ['react-router-dom'],
                        reduxToolkit: ['@reduxjs/toolkit'],
                        qrCode: ['react-qr-code'],
                        toastify: ['react-toastify'],
                        thalesUtils: ['thales-utils'],
                        thalesData: ['thales-data'],
                        styledComponents: ['styled-components'],
                        i18next: ['i18next'],
                        lodash: ['lodash'],
                        axios: ['axios'],
                        dateFns: ['date-fns'],
                        htmlToImage: ['html-to-image'],
                        buffer: ['buffer'],
                        history: ['history'],
                        i18nextBrowser: ['i18next-browser-languagedetector'],
                        queryString: ['query-string'],
                        tooltip: ['rc-tooltip'],
                        react: ['react'],
                        reactDom: ['react-dom'],
                        errorBoundary: ['react-error-boundary'],
                        reactI18next: ['react-i18next'],
                        modal: ['react-modal'],
                        redux: ['react-redux'],
                        select: ['react-select'],
                        // TODO: Test biconomy and particle
                        biconomy: ['@biconomy/account'],
                        particleAuth: ['@particle-network/authkit'],
                        particleUniversal: ['@particle-network/universal-account-sdk'],
                        tanstack: ['@tanstack/react-query', '@tanstack/react-table'],
                        recharts: ['recharts'],
                        scrollbars: ['react-custom-scrollbars-2', 'react-horizontal-scrolling-menu'],
                        carousel: ['react-responsive-carousel'],
                        dompurify: ['dompurify'],
                        helmet: ['react-helmet'],
                    },
                },
            },
        },
    };
});
