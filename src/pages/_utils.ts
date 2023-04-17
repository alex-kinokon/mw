import { useMemo } from "react";
import { MediaWiki } from "~/wiki";

export function useMediaWiki(project: string, lang: string) {
  return useMemo(() => {
    switch (project) {
      case "wiki":
      case "wikipedia":
        return new MediaWiki(`${lang}.wikipedia.org`);

      default:
        throw new Error(`Unknown project: ${project}`);
    }
  }, [project, lang]);
}
