import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import pkg from "./package.json";
const input = ["src/index.js"];

export default [
    {
        // UMD
        input,
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
            }),
            terser(),
        ],
        output: {
            file: `dist/${pkg.name}.min.js`,
            format: "umd",
            name: "vue-resolver", // this is the name of the global object
            exports: "named",
            sourcemap: true,
        },
    },
// ESM and CJS
    {
        input,
        plugins: [nodeResolve(), babel({
            babelHelpers: "bundled",
            presets: ["@babel/preset-env"]
        }),
            terser(),],
        output: [
            {
                dir: "dist/esm",
                format: "esm",
                exports: "named",
                sourcemap: true,
            },{
                dir: "dist/es",
                format: 'es',
                exports: "named",
                sourcemap: true,
            },
            {
                dir: "dist/umd",
                name: 'vue-resolver',
                file: pkg.browser,
                format: 'umd',
                exports: "named",
                sourcemap: true,
            },
            {
                dir: "dist/cjs",
                format: "cjs",
                exports: "named",
                sourcemap: true,
            },
        ],
    },
];
