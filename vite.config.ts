import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: ['index.html', 'samples/index.html'],
    },
  },
  test: { environment: 'jsdom' },
});
