import { Redirect } from "wouter";
import { useMediaWiki } from "~/pages/_utils";
import { useSiteInfo } from "~/wiki/hooks";

interface PageParams {
  readonly project: string;
  readonly lang: string;
}

export default function ProjectHomePage({
  params: { project, lang },
}: {
  params: PageParams;
}) {
  const { data } = useSiteInfo(useMediaWiki(project, lang));
  if (!data) {
    return null;
  }

  const page = new URL(data.general.base).pathname.replace(/^\/wiki\//, "");
  return <Redirect to={`/${project}/${lang}/page/${page}`} />;
}
