import { Helmet } from "react-helmet-async";
import {
  Alignment,
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  Popover,
} from "@blueprintjs/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { InterwikiLanguage } from "../InterwikiLanguage";

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
  readonly page: string;
}

export default function Page({ params }: { params: PageParams }) {
  const [, navigate] = useLocation();
  const { project, page } = params;

  const mediaWiki = useMediaWiki(project);
  const queryClient = useQueryClient();
  const { isLoading, data, error } = useQuery(createPageQuery(mediaWiki, page));

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
    <div
      className={css`
        display: grid;
        grid-template-areas:
          "header header"
          "sidebar content"
          "footer footer";
        grid-template-rows: 0 1fr;
        grid-template-columns: 300px 1fr;
        min-height: 100vh;
        --header-height: 50px;
      `}
    >
      <Helmet>
        <title>
          {value.title} — {project}
        </title>
        <link rel="icon" href="https://en.wikipedia.org/static/favicon/wikipedia.ico" />
      </Helmet>

      <Navbar
        className={css`
          grid-area: header;
          position: sticky;
          top: 0;
          z-index: 1;
        `}
      >
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
          <Popover content={<InterwikiLanguage links={value.langlinks} />}>
            <Button icon="globe" />
          </Popover>
        </NavbarGroup>
      </Navbar>

      <ScrollToTop />

      <div
        className={css`
          display: flex;
          flex-direction: column;
          grid-area: sidebar;
          position: sticky;
          top: 0;
        `}
      >
        <div className={CONTENT}>
          <TOC value={value.sections} />
        </div>
        <div className={SPACER} />
      </div>

      <div
        className={css`
          grid-area: content;
          display: flex;
          padding-top: var(--header-height);
          padding-right: 100px;
          padding-left: 20px;
        `}
      >
        <div className={SPACER} />
        <div className={CONTENT}>
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
                [id] {
                  padding-top: var(--header-height);
                  margin-top: calc(var(--header-height) * -1);
                }
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

      <footer
        className={css`
          grid-area: footer;
        `}
      >
        Footer
      </footer>
    </div>
  );
}

const SPACER = css`
  flex-grow: 1;
`;
const CONTENT = css`
  position: sticky;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
  overflow: scroll;
`;
