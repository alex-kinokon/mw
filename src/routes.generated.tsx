import { createElement, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

export const data: {
  path: string;
  render: () => Promise<{ default: React.ComponentType }>;
}[] = [
  { path: "/", render: () => import("./pages/index.page") },
  { path: "/:project/:lang/:page", render: () => import("./pages/[project]/[lang]/[page].page") },
];

export default createBrowserRouter(
  data.map(({ path, render }) => ({
    path,
    element: createElement(lazy(render)),
  }))
);
