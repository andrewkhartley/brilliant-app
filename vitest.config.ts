import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: [
            'resources/js/**/*.{test,spec}.ts',
            'resources/js/**/__tests__/**/*.ts',
        ],
        globals: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
