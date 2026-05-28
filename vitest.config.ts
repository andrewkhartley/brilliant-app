import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: [
            'resources/js/**/*.{test,spec}.{ts,tsx}',
            'resources/js/**/__tests__/**/*.{ts,tsx}',
        ],
        globals: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
