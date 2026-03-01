import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['phaser'],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
  esbuildOptions(options) {
    options.banner = {
      js: '/**\n * Phaser Debug Draw Plugin v8.0.0\n * Compatible with Phaser 3.53.0+ and Phaser 4.0.0+\n */',
    };
  },
});
