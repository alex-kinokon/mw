import clsx from "clsx";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { css, cx } from "@emotion/css";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "~/utils/router";
import { HTML } from "~/components/HTML";
import { useEvent } from "~/hooks/useEvent";
import type { Action, MediaWiki } from "~/wiki";
import { ScrollToTop } from "~/components/ScrollToTop";
import { applyDarkMode } from "~/dark-mode/bootstrap";
import { createQueryOptions } from "~/utils/react-query";
import { usePageStyles } from "../../hooks/usePageStyles";
import { Content } from "../styled";
import { useMediaWiki } from "~/hooks/useMediaWiki";
import { processWikiHTML } from "../wikitext";
import { parse } from "~/wiki/actions.generated";
import { useSiteInfo } from "~/wiki/hooks";
import { ArticleHeader } from "./Header";
import { ArticleContext } from "./Context";
import { ArticleTableOfContent } from "./TableOfContent";

const createPageQuery = (wiki: MediaWiki, page: string) =>
  createQueryOptions({
    queryKey: ["page", wiki.host, page] as const,
    queryFn: () =>
      parse<Action.ParsePageResponse>(wiki.action, {
        origin: "*",
        redirects: true,
        page: decodeURIComponent(page),
      }),
  });

function getHref(a: EventTarget, prefix: string) {
  if (!(a instanceof HTMLAnchorElement)) return;

  const href = a.getAttribute("href")!;
  if (href.startsWith(prefix)) {
    return href.slice(prefix.length);
  }
}

export function ArticlePage({
  params,
}: {
  params: Readonly<{
    project: string;
    page: string;
  }>;
}) {
  const navigate = useNavigate();
  let { project, page } = params;
  page = decodeURIComponent(page).replace(/_/g, " ");

  const mediaWiki = useMediaWiki(project);
  const queryClient = useQueryClient();
  const { data } = useQuery(createPageQuery(mediaWiki, page));
  const { data: siteInfo } = useSiteInfo(mediaWiki);

  const className = usePageStyles(mediaWiki, page);

  const onClick = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const nextPage = getHref(e.target, "/wiki/");
    if (nextPage) {
      e.preventDefault();
      navigate(`/${project}/view/${nextPage}`);
    }
  });

  const onHover = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const page = getHref(e.target, "/wiki/");
    if (page) {
      e.preventDefault();
      void queryClient.prefetchQuery(createPageQuery(mediaWiki, page));
    }
  });

  const dispose = useRef<() => void>();

  const onLoad = useEvent((node: HTMLElement) => {
    applyDarkMode(node);
    dispose.current = processWikiHTML(node);
  });

  useEffect(() => () => dispose.current?.(), []);

  const isMainPage = page === siteInfo?.general.mainpage;

  const articleContext = useMemo(
    () => ({ wiki: mediaWiki, page, article: data }),
    [mediaWiki, page, data]
  );

  return (
    <ArticleContext.Provider value={articleContext}>
      <Helmet>
        <title>
          {data?.title ?? "Loading"} — {project}
        </title>
        <link
          rel="icon"
          href={
            siteInfo?.general.favicon ??
            "https://en.wikipedia.org/static/favicon/wikipedia.ico"
          }
        />
      </Helmet>

      <div
        css={clsx(
          "grid min-h-full w-full grid-rows-[0_1fr]",
          isMainPage ? "grid-cols-[0_minmax(0,1fr)]" : "grid-cols-[300px_minmax(0,1fr)]"
        )}
        style={{
          "--header-height": "50px",
          gridTemplateAreas: `"header header" "sidebar content" "footer footer"`,
        }}
      >
        <ArticleHeader />
        <ScrollToTop />

        <div css="sticky top-0 flex flex-col grid-area-[sidebar]">
          <ArticleTableOfContent />
          <div css="grow" />
        </div>

        <div
          css={clsx(
            "flex pl-5 pr-14 pt-[var(--header-height)] grid-area-[content]",
            isMainPage && "ml-24"
          )}
        >
          <div css="top-[var(--header-height)] h-[calc(100vh-var(--header-height))] overflow-scroll">
            <h2 css="mb-4 text-3xl font-semibold">
              {data != null && <HTML>{data.displaytitle}</HTML>}
            </h2>
            <Content
              className={cx(
                className,
                "mw-parser-output",
                css`
                  [id] {
                    padding-top: var(--header-height);
                    margin-top: calc(var(--header-height) * -1);
                  }
                `
              )}
              onClick={onClick}
              onMouseOver={onHover}
            >
              {data != null && (
                <HTML tag="div" refCallback={onLoad}>
                  {data.text}
                </HTML>
              )}
            </Content>
          </div>
        </div>

        <footer css="grid-area-[footer]" />
      </div>
    </ArticleContext.Provider>
  );
}
