import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "build/esm/index.js",
      format: "es",
    },
    plugins: [typescript(), resolve()],
    external: ["mysql2/promise"],
  },
  {
    input: "src/index.ts",
    output: {
      file: "build/types/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
    external: ["mysql2/promise"],
  },
];

export default config;

