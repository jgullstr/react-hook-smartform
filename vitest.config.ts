import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    projects: [
      { extends: true, test: { name: 'react-hook-form@latest' } },
      {
        extends: true,
        test: { name: 'react-hook-form@7.77', env: { SMARTFORM_RHF_FLOOR: '7.77.0' } },
        resolve: { alias: { 'react-hook-form': 'react-hook-form-floor' } },
      },
    ],
  },
})
