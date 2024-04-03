import { useMemo } from "react";
import { MediaWiki } from "~/wiki";

export function useMediaWiki(project: string) {
  return useMemo(() => MediaWiki(project.split(".").reverse().join(".")), [project]);
}
