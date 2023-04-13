import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { Helmet } from "react-helmet";
import { Box, Heading, Progress, Skeleton, Text } from "@chakra-ui/react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { HTML } from "~/components/HTML";
import { useEvent } from "~/hooks/useEvent";
import Layout from "~/layouts/index";
import * as wiki from "~/wiki";
import { ScrollToTop } from "~/components/ScrollToTop";
import { Search } from "~/components/Search";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";

interface PageRoute {
  readonly project: string;
  readonly lang: string;
  readonly page: string;
}

function useRoute() {
  return useParams() as unknown as PageRoute;
}

const params = {
  format: "json",
  origin: "*",
  redirects: true,
} as const;

async function fetchPage(args: PageRoute) {
  const { parse } = await wiki.parse(wiki.getHost(args.project, args.lang), {
    ...params,
    page: decodeURIComponent(args.page),
  });
  return parse;
}

const MOBILE = { display: { base: "flex", md: "none" } } as const;
const DESKTOP = { display: { base: "none", md: "flex" }, flex: { md: "1" } } as const;

export default function Page() {
  const navigate = useNavigate();
  const { project, lang, page } = useRoute();
  const queryKey = ["page", { project, lang, page }] as const;

  const queryClient = useQueryClient();
  const { isLoading, data, error } = useQuery({
    queryKey,
    queryFn: ({ queryKey: [, route] }) => fetchPage(route),
  });

  const className = usePageStyles();

  const onClick = useEvent((e: React.MouseEvent<HTMLElement>) => {
    if (e.target instanceof HTMLAnchorElement) {
      const href = e.target.getAttribute("href")!;
      if (href.startsWith("/wiki/")) {
        e.preventDefault();
        navigate(`/${project}/${lang}/${href.slice("/wiki/".length)}`);
      }
    }
  });

  const onHover = useEvent((e: React.MouseEvent<HTMLElement>) => {
    if (e.target instanceof HTMLAnchorElement) {
      const href = e.target.getAttribute("href")!;
      if (href.startsWith("/wiki/")) {
        e.preventDefault();
        const page = href.slice("/wiki/".length);
        queryClient.prefetchQuery({
          queryKey: ["page", { project, lang, page }] as const,
          queryFn: ({ queryKey: [, route] }) => fetchPage(route),
        });
      }
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
            <TopSearch />
          </Box>
        </>
      }
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
      <Content className={className} onClick={onClick} onMouseOver={onHover}>
        <HTML tag="div">{value.text["*"]}</HTML>
      </Content>
    </Layout>
  );
}

function TopSearch() {
  const { project, lang } = useRoute();
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 500);

  const { data } = useQuery({
    enabled: debouncedValue.length > 0,
    queryKey: ["search", project, lang, debouncedValue],
    queryFn: () =>
      wiki.query<wiki.SearchResponse>(wiki.getHost(project, lang), {
        list: "search",
        srsearch: debouncedValue,
        utf8: true,
        format: "json",
        origin: "*",
      }),
  });

  const searchItems =
    data?.query.search.map(item => ({ ...item, key: item.title })) ?? [];

  return (
    <Search
      width={600}
      mx="auto"
      placeholder="Search"
      value={value}
      isLoading={false}
      input={{ iconPosition: "left" }}
      onSearchChange={e => {
        setValue(e.target.value);
      }}
      onResultSelect={() => {}}
      resultRenderer={item => (
        <Box>
          <Link to={`/${project}/${lang}/${encodeURIComponent(item.title)}`}>
            <Text fontWeight={500}>{item.title}</Text>
            <Text fontSize="sm">
              <HTML>{item.snippet}</HTML>
            </Text>
          </Link>
        </Box>
      )}
      searchResults={searchItems}
    />
  );
}

function usePageStyles() {
  const { project, lang, page } = useRoute();

  const { data: head } = useQuery({
    queryKey: ["styles", project, lang, page],
    queryFn: () =>
      wiki.parse<{
        headhtml: { "*": string };
      }>(wiki.getHost(project!, lang!), {
        ...params,
        page,
        prop: "headhtml",
      }),
  });

  const html = head?.parse.headhtml["*"];

  const hrefs = useMemo(() => {
    if (!html) return [];

    const dom = new DOMParser().parseFromString(html, "text/html");
    const links = dom.querySelectorAll("link[rel=stylesheet]");
    return Array.from(links).map(link => link.getAttribute("href")!);
  }, [html]);

  const queries = useQueries({
    queries: hrefs.map(href => ({
      queryKey: ["style", href],
      queryFn: () =>
        fetch("https://" + wiki.getHost(project, lang) + href).then(res => res.text()),
    })),
  });

  const styles = useMemo(() => queries.map(q => q.data).join("\n"), [queries]);
  const className = css(styles);

  return className;
}

const Content = styled.div`
  a {
    color: var(--chakra-colors-blue-600);
  }
  html[data-theme="dark"] & a {
    color: var(--chakra-colors-blue-300);
  }

  p {
    max-width: 900px;
    line-height: 1.6;
    margin-bottom: 7px;
  }

  .mw-editsection {
    display: none;
  }

  div.tright,
  div.floatright,
  table.floatright {
    clear: right;
    float: right;
  }

  h2,
  h3,
  h4 {
    font-weight: 600;
  }

  h2 {
    font-size: var(--chakra-fontSizes-2xl);
    margin-top: 10px;
  }

  h3 {
    font-size: var(--chakra-fontSizes-xl);
    margin-top: 10px;
  }

  h4 {
    font-size: var(--chakra-fontSizes-lg);
    margin-top: 10px;
  }

  ol,
  ul {
    padding-inline-start: 1.5em;
  }

  dl {
    margin-top: 0.2em;
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin-left: 1.6em;
    margin-bottom: 0.6em;
  }
`;
