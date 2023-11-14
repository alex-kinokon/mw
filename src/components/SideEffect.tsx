import { useEffect } from "react";
import { Classes } from "@blueprintjs/core";
import { useDarkMode } from "~/hooks/useDarkMode";

function DarkModeQuery() {
  const dark = useDarkMode();
  useEffect(() => {
    document.body.classList.toggle(Classes.DARK, dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return null;
}

export function SideEffect() {
  return (
    <>
      <DarkModeQuery />
    </>
  );
}
