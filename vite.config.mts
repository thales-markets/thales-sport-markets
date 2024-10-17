import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { ConfigEnv, Plugin, PluginOption, defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
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

const plugins = (mode: string): PluginOption[] => {
    return [
        react(),
        tsconfigPaths(),
        svgr(),
        checker({
            typescript: true,
        }),
        eslint({
            failOnError: true,
            failOnWarning: true,
            emitError: true,
            emitWarning: true,
            useEslintrc: true,
            exclude: ['node_modules'],
        }),
        particleWasmPlugin,
    ];
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        // depending on your application, base can also be "/"
        define: {
            'process.env': env,
        },
        base: '',
        plugins: plugins(mode),
        server: {
            // this ensures that the browser opens upon server start
            open: true,
            // this sets a default port to 3000
            port: 3000,
        },
    };
});
