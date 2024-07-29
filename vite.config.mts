import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getTailwindPlugins } from "@aet/tailwind";
import tsconfigPaths from "vite-tsconfig-paths";
import { fixBlueprint } from "./scripts/blueprint-fix";
import config from "./tailwind.config";

const tw = getTailwindPlugins({
  tailwindConfig: config,
  clsx: "clsx",
  vite: true,
  jsxAttributeAction: ["rename", "data-css"],
});

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["@aet/tailwind/macro"],
  },
  build: {
    target: ["chrome112", "safari16"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // https://sass-lang.com/documentation/breaking-changes/mixed-decls/
        quietDeps: true,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    tw.vite(),
    react({
      babel: {
        plugins: [
          "@emotion/babel-plugin",
          [
            "babel-plugin-macros",
            {
              isMacrosName: (v: string) =>
                v !== "@aet/tailwind/macro" && /[./]macro(\.c?js)?$/.test(v),
            },
          ],
          tw.babel(),
        ],
      },
    }),
    fixBlueprint,
  ],
});
