import { Helmet } from "react-helmet-async";
import { Box, Heading, Progress, Skeleton } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { HTML } from "~/components/HTML";
import { useEvent } from "~/hooks/useEvent";
import Layout from "~/layouts/index";
import * as wiki from "~/wiki";
import { ScrollToTop } from "~/components/ScrollToTop";
import { applyDarkMode } from "~/dark-mode/bootstrap";
import { TOC } from "./TOC";
import { SearchBox } from "./SearchBox";
import { createQueryOptions } from "~/utils/react-query";
import { usePageStyles } from "./pageStyles";
import { Content } from "./Content";

export interface PageRoute {
  readonly host: string;
  readonly page: string;
}

const MOBILE = { display: { base: "flex", md: "none" } } as const;
const DESKTOP = { display: { base: "none", md: "flex" }, flex: { md: "1" } } as const;

const createPageQuery = (route: PageRoute) =>
  createQueryOptions({
    queryKey: ["page", route] as const,
    queryFn: async ({ queryKey: [, route] }) => {
      const { parse } = await wiki.parse(route.host, {
        format: "json",
        origin: "*",
        redirects: true,
        page: decodeURIComponent(route.page),
      });
      return parse;
    },
  });

export default function Page() {
  const navigate = useNavigate();
  const params = useParams() as unknown as {
    readonly project: string;
    readonly lang: string;
    readonly page: string;
  };
  const { project, lang, page } = params;

  const host = useMemo(() => wiki.getHost(project, lang), [project, lang]);
  const route: PageRoute = useMemo(() => ({ host, page }), [host, page]);

  const queryClient = useQueryClient();
  const { isLoading, data, error } = useQuery(createPageQuery(route));

  const className = usePageStyles(route);

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
        queryClient.prefetchQuery(createPageQuery({ host, page }));
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
            <SearchBox host={host} />
          </Box>
        </>
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
      <Content className={className} onClick={onClick} onMouseOver={onHover}>
        <HTML
          tag="div"
          refCallback={node => {
            applyDarkMode(node);
          }}
        >
          {value.text["*"]}
        </HTML>
      </Content>
    </Layout>
  );
}
