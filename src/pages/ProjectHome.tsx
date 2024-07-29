import { Redirect } from "~/utils/router";
import { useMediaWiki } from "~/hooks/useMediaWiki";
import { useSiteInfo } from "~/wiki/hooks";

export function ProjectHomePage({
  params: { project },
}: {
  params: { readonly project: string };
}) {
  const { data } = useSiteInfo(useMediaWiki(project));
  if (!data) return null;

  const page = new URL(data.general.base).pathname.replace(/^\/wiki\//, "");
  return <Redirect href={`/${project}/view/${page}`} />;
}
