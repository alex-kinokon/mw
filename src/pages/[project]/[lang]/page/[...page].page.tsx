import { Helmet } from "react-helmet-async";
import {
  Alignment,
  Button,
  Classes,
  Menu,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  Popover,
} from "@blueprintjs/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useLocation } from "wouter";
import { css, cx } from "@emotion/css";
import { HTML } from "~/components/HTML";
import { useEvent } from "~/hooks/useEvent";
import type { Action, MediaWiki } from "~/wiki";
import { ScrollToTop } from "~/components/ScrollToTop";
import { applyDarkMode } from "~/dark-mode/bootstrap";
import { TOC } from "../TOC";
import { SearchBox } from "../SearchBox";
import { createQueryOptions } from "~/utils/react-query";
import { usePageStyles } from "../_pageStyles";
import { Content } from "../_styled";
import { PageTabs } from "../Tabs";
import { useMediaWiki } from "~/pages/_utils";
import { processWikiHTML } from "../_wikitext";
import { ProjectPicker } from "~/components/ProjectPicker";
import { parse } from "~/wiki/actions.generated";

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

interface PageParams {
  readonly project: string;
  readonly lang: string;
  readonly page: string;
}

export default function Page({ params }: { params: PageParams }) {
  const [, navigate] = useLocation();
  const { project, lang, page } = params;

  const mediaWiki = useMediaWiki(project, lang);
  const queryClient = useQueryClient();
  const { isLoading, data, error } = useQuery(createPageQuery(mediaWiki, page));

  const className = usePageStyles(mediaWiki, page);

  const onClick = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const nextPage = getHref(e.target, "/wiki/");
    if (nextPage) {
      e.preventDefault();
      navigate(`./${nextPage}`);
    }
  });

  const onHover = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const page = getHref(e.target, "/wiki/");
    if (page) {
      e.preventDefault();
      void queryClient.prefetchQuery(createPageQuery(mediaWiki, page));
    }
  });

  const onLoad = useEvent((node: HTMLElement) => {
    applyDarkMode(node);
    processWikiHTML(node);
  });

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  const value = data!;

  return (
    <div>
      <Helmet>
        <title>
          {value.title} — {project}
        </title>
        <link rel="icon" href="https://en.wikipedia.org/static/favicon/wikipedia.ico" />
      </Helmet>

      <Navbar>
        <NavbarGroup
          align={Alignment.LEFT}
          className={css`
            margin-right: 50px;
          `}
        >
          <ProjectPicker />
          <NavbarDivider />
          <div
            className={css`
              margin-right: 10px;
              font-weight: 500;
            `}
          >
            {value.title}
          </div>
          <PageTabs wiki={mediaWiki} page={page} />
        </NavbarGroup>

        <NavbarGroup>
          <SearchBox
            wiki={mediaWiki}
            className={css`
              min-width: 50vw;
            `}
          />
        </NavbarGroup>

        <NavbarGroup align={Alignment.RIGHT}>
          <Popover
            content={
              <Menu
                className={css`
                  max-height: 50vh;
                  overflow-y: auto;
                `}
              >
                {value.langlinks.map(({ lang, url, autonym }) => (
                  <RouterLink
                    className={cx(
                      Classes.MENU_ITEM,
                      css`
                        color: var(--color-fg-default) !important;
                      `
                    )}
                    key={lang}
                    to={getLanguageLink(url)}
                    lang={lang}
                  >
                    <span>{autonym}</span>
                    <span
                      className={css`
                        opacity: 0.8;
                        margin-left: 0px;
                      `}
                    >
                      ({lang})
                    </span>
                  </RouterLink>
                ))}
              </Menu>
            }
          >
            <Button icon="globe" />
          </Popover>
        </NavbarGroup>
      </Navbar>

      <ScrollToTop />
      <div
        className={css`
          display: flex;
        `}
      >
        <TOC value={value.sections} />
        <div
          className={css`
            flex: 1;
          `}
        >
          <h2
            className={css`
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: 1rem;
            `}
          >
            <HTML>{value.displaytitle}</HTML>
          </h2>
          <Content
            className={cx(
              className,
              "mw-parser-output",
              css`
                scroll-padding-top: 50px;
              `
            )}
            onClick={onClick}
            onMouseOver={onHover}
          >
            <HTML tag="div" refCallback={onLoad}>
              {value.text}
            </HTML>
          </Content>
        </div>
      </div>
    </div>
  );
}

function getLanguageLink(link: string) {
  const url = new URL(link);
  const { hostname, pathname } = url;
  if (hostname.endsWith("wikipedia.org") || hostname.endsWith("wiktionary.org")) {
    const [lang, host] = hostname.split(".");
    return `/${host}/${lang}/${pathname.replace(/^\/wiki\//, "")}`;
  }

  return link;
}
