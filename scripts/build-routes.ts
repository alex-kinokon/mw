#!/usr/bin/env -S node -r esbuild-register
import fs from "fs";
import { extname, resolve } from "path";
import glob from "fast-glob";

const pagesDir = resolve(__dirname, "../src/pages");
const pages = glob
  .sync(["*.page.tsx", "**/*.page.tsx"], { cwd: pagesDir })
  .map((path, i) => ({
    path: path
      .replace(/(^|\/)index\.page\.tsx$/, "")
      .replace(/\.page\.tsx$/, "")
      .replace(/\[(.+?)\]/g, ":$1")
      .replace(/\.\.\./g, "*"),
    importee: `./pages/${path.slice(0, -extname(path).length)}`,
    identifier: `Page${i + 1}`,
  }));

const script = [
  'import { createElement, lazy } from "react";',
  'import { createBrowserRouter } from "react-router-dom";',
  "",
  "export const data: {",
  "  path: string;",
  "  render: () => Promise<{ default: React.ComponentType }>;",
  "}[] = [",
  ...pages.map(
    ({ path, importee }) => `  { path: "/${path}", render: () => import("${importee}") },`
  ),
  "];",
  "",
  "export default createBrowserRouter(",
  "  data.map(({ path, render }) => ({",
  "    path,",
  "    element: createElement(lazy(render)),",
  "  }))",
  ");",
  "",
].join("\n");

fs.writeFileSync(resolve(__dirname, "../src/routes.generated.tsx"), script);
