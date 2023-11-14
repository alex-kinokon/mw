import { useMediaQuery } from "@aet/hooks";

export function useDarkMode() {
  return useMediaQuery("(prefers-color-scheme: dark)");
}
