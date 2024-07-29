import { useMediaWiki } from "~/hooks/useMediaWiki";
import { getAllRevisions } from "~/wiki/actions.generated";

export function BlamePage({
  params,
}: {
  params: {
    readonly project: string;
    readonly page: string;
  };
}) {
  const { project } = params;
  const wiki = useMediaWiki(project);

  void getAllRevisions(wiki.action, {
    arvProp: ["content", "ids", "timestamp", "user", "userid", "parsedcomment", "size"],
    arvLimit: 50,
  });

  return null;
}
