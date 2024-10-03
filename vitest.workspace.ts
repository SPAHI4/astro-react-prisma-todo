/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Astro and server tests (without jsdom)
  getViteConfig({
    test: {
      exclude: ['**/*.test.tsx', 'node_modules'],
    },
  }),

  // React tests
  getViteConfig({
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      exclude: ['src/actions/*.test.ts', 'node_modules'],
    },
  }),
]);
