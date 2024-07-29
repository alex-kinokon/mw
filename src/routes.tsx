import { Router, Redirect, Route } from "./utils/router";
import { ProjectHomePage } from "./pages/ProjectHome";
import { BlamePage } from "./pages/blame";
import { ArticlePage } from "./pages/view/Article";

export default (
  <Router>
    <Route path="/">
      <Redirect href="/org.wikipedia.en/view/Main_Page" />
    </Route>
    <Route path=":project" component={ProjectHomePage} />
    <Route path="/:project/blame/:page" component={BlamePage} />
    <Route path="/:project/view/:page+" component={ArticlePage} />
    <Route>404</Route>
  </Router>
);
