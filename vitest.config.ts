import { defineConfig } from 'vitest/config'
import vitestOpenApiPlugin from './vitest-openapi-plugin.js'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['./database_test_setup.ts']
  },
  plugins: [vitestOpenApiPlugin]
})
