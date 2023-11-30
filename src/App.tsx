import { HelmetProvider } from "react-helmet-async";
import { Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Route, Router } from "./utils/router";
import { SideEffect } from "./components/SideEffect";
import routes from "./routes.generated";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => (
  <HelmetProvider>
    <SideEffect />
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Suspense fallback={null}>
        <Router>
          {routes}
          <Route>404</Route>
        </Router>
      </Suspense>
    </PersistQueryClientProvider>
  </HelmetProvider>
);

export default App;
