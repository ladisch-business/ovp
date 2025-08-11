import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 0.85,
        branches: 0.85,
        functions: 0.85,
        statements: 0.85
      }
    }
  }
})
