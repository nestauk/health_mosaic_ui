import svelte from 'rollup-plugin-svelte';
import commonjs from 'rollup-plugin-commonjs';

export default {
  bundler: 'rollup',
  plugins: [svelte(), commonjs()],
};
