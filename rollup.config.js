import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const config = [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/esm/index.js',
      format: 'es',
    },
    plugins: [typescript(), resolve()],
    external: [],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
    },
    plugins: [typescript(), resolve()],
    external: [],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
    external: [],
  },
];

export default config;
