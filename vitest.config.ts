/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  // plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
