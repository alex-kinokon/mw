import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { css } from "@emotion/css";
import type { MediaWiki } from "~/wiki";

export function usePageStyles(wiki: MediaWiki, page: string) {
  const { data: head } = useQuery({
    queryKey: ["headhtml", wiki.host, page],
    queryFn: () =>
      wiki.action.parse<{ parse: { headhtml: string } }>({
        origin: "*",
        redirects: true,
        page,
        prop: ["headhtml"],
      }),
  });

  const html = head?.parse.headhtml;

  const hrefs = useMemo(() => {
    if (!html) return [];

    const dom = new DOMParser().parseFromString(html, "text/html");
    const links = dom.querySelectorAll("link[rel=stylesheet]");
    return Array.from(links).map(link => link.getAttribute("href")!);
  }, [html]);

  const queries = useQueries({
    queries: hrefs.map(href => ({
      queryKey: ["style", href],
      queryFn: () => fetch(`https://${wiki.host}${href}`).then(res => res.text()),
    })),
  });

  const styles = useMemo(() => queries.map(q => q.data).join("\n"), [queries]);
  const className = css(styles);

  return className;
}
