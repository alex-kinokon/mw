import type { ThemeConfig } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

export default extendTheme({
  config,
});

export function Tokens() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const tokens: Record<string, string> = useMemo(() => ({}), []);

  return (
    <Helmet>
      <body
        style={
          Object.entries(tokens)
            .map(([key, value]) => `${key}: ${value};`)
            .join(" ") as any
        }
      />
    </Helmet>
  );
}
