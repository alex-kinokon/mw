#!/usr/bin/env bun
import { promises as fs } from "fs";
import { extname, resolve } from "path";
import { format } from "prettier";
import glob from "fast-glob";

const pagesDir = resolve(__dirname, "../src/pages");
const pages = glob
  .sync(["*.page.tsx", "**/*.page.tsx"], { cwd: pagesDir })
  .map((path, i) => ({
    path: path
      .replace(/(^|\/)index\.page\.tsx$/, "")
      .replace(/\.page\.tsx$/, "")
      .replace(/\[\.\.\.(.+?)\]/g, ":$1+")
      .replace(/\[(.+?)\]/g, ":$1")
      .replace(/\.\.\./g, "*"),
    importee: `./pages/${path.slice(0, -extname(path).length)}`,
    identifier: `Page${i + 1}`,
  }));

const script = /* jsx */ `
  import { lazy } from "react"
  import type { RouteComponentProps } from "wouter"
  import { Route, Router } from "wouter"

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
