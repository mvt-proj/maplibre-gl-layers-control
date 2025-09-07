import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/ResetViewControl.ts",
  output: [
    {
      file: "dist/reset_view_control.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/reset_view_control.umd.js",
      format: "umd",
      name: "ResetViewControl",
      sourcemap: true,
    },
  ],
  external: ["maplibre-gl"],
  plugins: [typescript()],
};
