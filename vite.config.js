import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ReactHookSmartform',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'modern' : format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-hook-form'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-hook-form': 'ReactHookForm',
        },
      },
    },
    outDir: 'dist',
  },
});
