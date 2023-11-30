import { lazy } from "react";
import type { RouteComponentProps } from "./utils/router";
import { Route, Router } from "./utils/router";

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
    path: "/:project",
    render: () => import("./pages/[project]/index.page"),
  },
  {
    path: "/:project/blame/:page",
    render: () => import("./pages/[project]/blame/[page].page"),
  },
  {
    path: "/:project/view/:page+",
    render: () => import("./pages/[project]/view/[...page].page"),
  },
];

export default data.map(({ path, render }) => (
  <Route key={path} path={path} component={lazy(render)} />
));
