import { Helmet } from "react-helmet-async";
import {
  Box,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Skeleton,
} from "@chakra-ui/react";
import { BsGlobe } from "react-icons/bs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { css, cx } from "@emotion/css";
import { HTML } from "~/components/HTML";
import { useEvent } from "~/hooks/useEvent";
import Layout from "~/layouts/index";
import type { ParseResponse } from "~/wiki";
import { MediaWiki, getHost } from "~/wiki";
import { ScrollToTop } from "~/components/ScrollToTop";
import { applyDarkMode } from "~/dark-mode/bootstrap";
import { TOC } from "./TOC";
import { SearchBox } from "./SearchBox";
import { createQueryOptions } from "~/utils/react-query";
import { usePageStyles } from "./pageStyles";
import { Content } from "./Content";
import { PageTabs } from "./Tabs";

const MOBILE = { display: { base: "flex", md: "none" } } as const;
const DESKTOP = { display: { base: "none", md: "flex" }, flex: { md: "1" } } as const;

const createPageQuery = (wiki: MediaWiki, page: string) =>
  createQueryOptions({
    queryKey: ["page", wiki.host, page] as const,
    queryFn: async () => {
      const { parse } = await wiki.parse<ParseResponse>({
        format: "json",
        origin: "*",
        redirects: true,
        page: decodeURIComponent(page),
      });
      return parse;
    },
  });

function getHref(a: EventTarget, prefix: string) {
  if (!(a instanceof HTMLAnchorElement)) return;

  const href = a.getAttribute("href")!;
  if (href.startsWith(prefix)) {
    return href.slice(prefix.length);
  }
}

export default function Page() {
  const navigate = useNavigate();
  const params = useParams() as unknown as {
    readonly project: string;
    readonly lang: string;
    readonly page: string;
  };
  const { project, lang, page } = params;

  const mediaWiki = useMemo(() => new MediaWiki(getHost(project, lang)), [project, lang]);
  const queryClient = useQueryClient();
  const { isLoading, data, error } = useQuery(createPageQuery(mediaWiki, page));

  const className = usePageStyles(mediaWiki, page);

  const onClick = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const nextPage = getHref(e.target, "/wiki/");
    if (nextPage) {
      e.preventDefault();
      navigate(`../${nextPage}`, { relative: "path" });
    }
  });

  const onHover = useEvent((e: React.MouseEvent<HTMLElement>) => {
    const page = getHref(e.target, "/wiki/");
    if (page) {
      e.preventDefault();
      queryClient.prefetchQuery(createPageQuery(mediaWiki, page));
    }
  });

  if (isLoading) {
    return (
      <Layout prefix={<Progress size="xs" isIndeterminate />}>
        <Skeleton />
      </Layout>
    );
  }

  if (error) {
    return <Layout>Error: {JSON.stringify(error)}</Layout>;
  }

  const value = data!;

  return (
    <Layout
      title={
        <>
          <Box {...MOBILE}>{value.title}</Box>
          <Box {...DESKTOP}>
            <PageTabs wiki={mediaWiki} page={page} />
            <SearchBox wiki={mediaWiki} />
          </Box>
        </>
      }
      titleIcons={
        <Menu>
          <MenuButton as={IconButton} icon={<BsGlobe />} size="lg" variant="ghost" />
          <MenuList
            className={css`
              max-height: min(600px, 70vh);
              overflow-y: auto;
            `}
          >
            {value.langlinks.map(({ lang, url, autonym }) => (
              <MenuItem key={lang} as={RouterLink} to={getLanguageLink(url)} lang={lang}>
                {autonym}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      }
      sidebarContent={<TOC value={value.sections} />}
    >
      <ScrollToTop />
      <Helmet>
        <title>
          {value.title} — {project}
        </title>
      </Helmet>
      <Heading fontSize="3xl" fontWeight={600} mb={3}>
        <HTML>{value.displaytitle}</HTML>
      </Heading>
      <Content
        className={cx(className, "mw-parser-output")}
        onClick={onClick}
        onMouseOver={onHover}
      >
        <HTML
          tag="div"
          refCallback={node => {
            applyDarkMode(node);
          }}
        >
          {value.text}
        </HTML>
      </Content>
    </Layout>
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
