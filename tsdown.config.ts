import { defineConfig } from 'tsdown';

export default defineConfig({
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: {
    build: false,
  },
  entry: ['./src/index.ts'],
  format: {
    esm: {
      target: ['node20'],
    },
    cjs: {
      target: ['node20'],
    },
  },
  platform: 'node',
  sourcemap: false,
});
