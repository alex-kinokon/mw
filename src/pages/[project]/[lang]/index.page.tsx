import { Redirect } from "wouter";
import { useMediaWiki } from "~/pages/_utils";
import { useSiteInfo } from "~/wiki/hooks";

interface PageParams {
  readonly project: string;
  readonly lang: string;
}

export default function ProjectHomePage({ params }: { params: PageParams }) {
  const { project, lang } = params;

  const wiki = useMediaWiki(project, lang);
  const { data } = useSiteInfo(wiki);

  if (!data) {
    return null;
  }

  const page = new URL(data.query.general.base).pathname.replace(/^\/wiki/, "");

  return <Redirect to={`./${page}/page`} />;
}
