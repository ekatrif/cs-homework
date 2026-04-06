import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main.ts'),
        benchmarks: resolve(__dirname, 'src/benchmarks.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
    target: 'node18',
    minify: false,
  },
});