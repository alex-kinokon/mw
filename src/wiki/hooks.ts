import { useQuery } from "@tanstack/react-query";
import type { MediaWiki } from "./index";
import { siteInfo } from "./action";

export function useSiteInfo(wiki: MediaWiki) {
  return useQuery({
    queryKey: ["siteInfo", wiki.host],
    queryFn: () => siteInfo(wiki.action, ["general", "namespaces"]),
  });
}
