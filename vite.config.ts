import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome112", "safari16"],
  },
  plugins: [
    react({
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    tsconfigPaths(),

    /**
     * Vite doesn't handle fallback html with dot (.), see https://github.com/vitejs/vite/issues/2415
     * https://github.com/bluwy/publint/blob/f84b81e2c9f0191e4aab99fe20b7e1ba385f1ec7/site/vite.config.js#L32-L51
     */
    {
      name: "spa-fallback-with-dot",
      configureServer: server => () => {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.includes(".") && !req.url.endsWith(".html")) {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
  ],
});
