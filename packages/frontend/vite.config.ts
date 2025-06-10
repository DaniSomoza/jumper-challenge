import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dotenv from 'dotenv'
import { configDefaults } from 'vitest/config'

dotenv.config({ path: resolve(__dirname, '../../.env') })

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.ts',
    exclude: [...configDefaults.exclude, 'node_modules'],
    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: './coverage'
    }
  }
})
