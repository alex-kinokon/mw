import { lazy } from "react";
import type { RouteComponentProps } from "wouter";
import { Route, Router } from "wouter";

export const data: {
  path: string;
  render: () => Promise<{
    default: React.ComponentType<RouteComponentProps<any>>;
  }>;
}[] = [
  {
    path: "/",
    render: () => import("./pages/index.page"),
  },
  {
    path: "/:project/:lang",
    render: () => import("./pages/[project]/[lang]/index.page"),
  },
  {
    path: "/:project/:lang/page/:page+",
    render: () => import("./pages/[project]/[lang]/page/[...page].page"),
  },
];

export default (
  <Router>
    {data.map(({ path, render }) => (
      <Route key={path} path={path} component={lazy(render)} />
    ))}
  </Router>
);
