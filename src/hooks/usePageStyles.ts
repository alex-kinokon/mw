import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { css } from "@emotion/css";
import type { MediaWiki } from "~/wiki";
import { parse } from "~/wiki/actions.generated";

export function usePageStyles(wiki: MediaWiki, page: string) {
  const { data: head } = useQuery({
    queryKey: ["headhtml", wiki.host, page],
    queryFn: () =>
      parse<{ headhtml: string }>(wiki.action, {
        origin: "*",
        redirects: true,
        page,
        prop: ["headhtml"],
      }),
  });

  const html = head?.headhtml;

  const hrefs = useMemo((): string[] => {
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
