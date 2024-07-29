import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class", ".bp5-dark"],
  content: [],
  theme: {
    extend: {
      spacing: {
        // 72 18rem
        // 80	20rem
        // 96 24rem
        128: "32rem",
      },
      zIndex: {
        1: "1",
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities }) => {
      matchUtilities({
        "grid-area": modifier => ({ gridArea: modifier }),
      });
    }),
  ],
} satisfies Config;
