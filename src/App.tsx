import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import theme from "./theme";
import routes from "./routes.generated";

const App = () => (
  <ChakraProvider theme={theme}>
    <ColorModeScript
      initialColorMode={theme.config.initialColorMode}
      type="localStorage"
    />
    <Suspense fallback={null}>
      <RouterProvider router={routes} />
    </Suspense>
  </ChakraProvider>
);

export default App;
