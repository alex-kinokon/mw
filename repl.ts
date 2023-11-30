#!/usr/bin/env -S node -r esbuild-register
import { buildSync } from "esbuild";

buildSync({
  entryPoints: ["./html-to-react/index.js"],
  outfile: "./src/utils/html-to-react.ts",
  bundle: true,
  format: "esm",
  packages: "external",
  platform: "node",
  target: "esnext",
});
