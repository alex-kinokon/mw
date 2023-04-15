import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { MediaWiki, getHost } from "~/wiki";
import { useSiteInfo } from "~/wiki/hooks";

export default function ProjectHomePage() {
  const params = useParams() as unknown as {
    readonly project: string;
    readonly lang: string;
  };
  const { project, lang } = params;

  const wiki = useMemo(() => new MediaWiki(getHost(project, lang)), [project, lang]);
  const { data } = useSiteInfo(wiki);

  if (!data) {
    return null;
  }

  return (
    <Navigate
      to={"." + new URL(data.query.general.base).pathname.replace(/^\/wiki/, "")}
      relative="path"
    />
  );
}
