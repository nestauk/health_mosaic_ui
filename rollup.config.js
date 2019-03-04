import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import img from 'rollup-plugin-img';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import less from 'less';
import typescript from 'rollup-plugin-typescript';
import copy from 'rollup-copy-plugin';
import pkg from './package.json';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

function transformLess() {
  return {
    style: async ({ content, attributes, filename }) => {
      if (!attributes.lang || attributes.lang !== 'less')
        return { code: content, map: '' };

      try {
        const { css, map, imports } = await less.render(content, { filename });
        return { code: css, dependencies: imports, map };
      } catch (err) {
        const { line, column, index: character, extract } = err;
        if (!(line && column && extract)) throw err;

        let frame;
        if (!extract[0]) {
          frame = extract.filter(v => v).map((l, i) => `${line + i}:${l}`);
        } else {
          frame = extract.filter(v => v).map((l, i) => `${line - 1 + i}:${l}`);
        }

        frame.splice(2, 0, '^'.padStart(column + line.toString().length + 2));

        delete err.line;
        delete err.column;
        delete err.index;
        delete err.extract;
        err.frame = frame.join('\n');

        err.start = { line, column, character };
        err.end = err.start;

        throw err;
      }
    },
  };
}

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    onwarn(message, warn) {
      if (/xstate/.test(message)) return;
      warn(message);
    },
    plugins: [
      copy({
        'node_modules/mapbox-gl/dist/mapbox-gl.css': 'static/mapbox-gl.css',
      }),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        preprocess: transformLess(),
      }),
      resolve(),
      commonjs(),
      img({
        output: 'static',
      }),
      typescript(),

      legacy &&
        babel({
          extensions: ['.js', '.html', '.svelte'],
          runtimeHelpers: true,
          exclude: ['node_modules/@babel/**'],
          presets: [
            [
              '@babel/preset-env',
              {
                targets: '> 0.25%, not dead',
              },
            ],
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            [
              '@babel/plugin-transform-runtime',
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          module: true,
        }),
    ],
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    onwarn(message, warn) {
      if (/xstate/.test(message)) return;
      warn(message);
    },
    plugins: [
      replace({
        'process.browser': false,
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      svelte({
        generate: 'ssr',
        dev,
        preprocess: transformLess(),
      }),
      resolve(),
      commonjs(),
      img({
        output: 'static',
      }),
      typescript(),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules ||
        Object.keys(process.binding('natives'))
    ),
  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      commonjs(),
      typescript(),
      !dev && terser(),
    ],
  },
};
