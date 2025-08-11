import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts', 'src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov'],
      include: ['src/store/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.tsx',
        'vite.config.ts',
        '**/tailwind.config.js',
        '**/postcss.config.js',
        '**/eslint.config.js'
      ],
      thresholds: {
        lines: 0.85,
        branches: 0.85,
        functions: 0.85,
        statements: 0.85
      }
    }
  }
})
