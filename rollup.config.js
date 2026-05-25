import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/esm/index.js',
      format: 'es',
    },
    cache: false,
    plugins: [typescript()],
    external: ['mysql2/promise'],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
    },
    cache: false,
    plugins: [typescript()],
    external: ['mysql2/promise'],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/types/index.d.ts',
      format: 'es',
    },
    cache: false,
    plugins: [dts()],
    external: ['mysql2/promise'],
  },
];
