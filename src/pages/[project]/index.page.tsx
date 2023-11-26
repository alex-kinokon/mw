import { Redirect } from "wouter";
import { useMediaWiki } from "~/pages/_utils";
import { useSiteInfo } from "~/wiki/hooks";

interface PageParams {
  readonly project: string;
}

export default function ProjectHomePage({ params: { project } }: { params: PageParams }) {
  const { data } = useSiteInfo(useMediaWiki(project));
  if (!data) {
    return null;
  }

  const page = new URL(data.general.base).pathname.replace(/^\/wiki\//, "");
  return <Redirect to={`/${project}/page/${page}`} />;
}
