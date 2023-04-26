import { Route, Router } from "wouter";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { HelmetProvider } from "react-helmet-async";
import { Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import theme, { Tokens } from "./theme";
import routes from "./routes.generated";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => (
  <HelmetProvider>
    <ChakraProvider theme={theme}>
      <Tokens />
      <ColorModeScript
        initialColorMode={theme.config.initialColorMode}
        type="localStorage"
      />
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <Suspense fallback={null}>
          <Router>
            {routes}
            <Route>404</Route>
          </Router>
        </Suspense>
      </PersistQueryClientProvider>
    </ChakraProvider>
  </HelmetProvider>
);

export default App;
