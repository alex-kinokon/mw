import { HelmetProvider } from "react-helmet-async";
import { Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { SideEffect } from "./components/SideEffect";
import routes from "./routes";

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
      <Suspense fallback={null}>{routes}</Suspense>
    </PersistQueryClientProvider>
  </HelmetProvider>
);

export default App;
