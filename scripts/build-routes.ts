#!/usr/bin/env bun
/* eslint-disable unicorn/string-content */
import { promises as fs } from "node:fs";
import { extname, resolve } from "node:path";
import { format } from "prettier";
import glob from "fast-glob";

const pagesDir = resolve(__dirname, "../src/pages");
const pages = glob
  .sync(["*.page.tsx", "**/*.page.tsx"], { cwd: pagesDir })
  .map((path, i) => ({
    path: path
      .replace(/(^|\/)index\.page\.tsx$/, "")
      .replace(/\.page\.tsx$/, "")
      .replace(/\[\.{3}(.+?)]/g, ":$1+")
      .replace(/\[(.+?)]/g, ":$1")
      .replace(/\.{3}/g, "*"),
    importee: `./pages/${path.slice(0, -extname(path).length)}`,
    identifier: `Page${i + 1}`,
  }));

const script = /* jsx */ `
  import { lazy } from "react"
  import type { RouteComponentProps } from "./utils/router"
  import { Route, Router } from "./utils/router"

  export const data: {
    path: string
    render: () => Promise<{
      default: React.ComponentType<RouteComponentProps<any>>;
    }>
  }[] = [
  ${pages
    .map(
      ({ path, importee }) =>
        `{\npath: "/${path}", \nrender: () => import("${importee}") }`
    )
    .join(",")},
  ]
  
  export default data.map(({ path, render }) => (
    <Route key={path} path={path} component={lazy(render)} />
  ));
`;

await fs.writeFile(
  resolve(__dirname, "../src/routes.generated.tsx"),
  await format(script, { parser: "babel-ts" })
);
