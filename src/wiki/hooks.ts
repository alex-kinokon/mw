import { useQuery } from "@tanstack/react-query";
import type { MediaWiki } from "./index";

export function useSiteInfo(wiki: MediaWiki) {
  return useQuery({
    queryKey: ["siteInfo", wiki.host],
    queryFn: () => wiki.action.siteInfo(),
  });
}
