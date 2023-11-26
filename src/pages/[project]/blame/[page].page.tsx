import { useMediaWiki } from "~/pages/_utils";
import { getAllRevisions } from "~/wiki/actions.generated";

interface PageParams {
  readonly project: string;
  readonly page: string;
}

export default function BlamePage({ params }: { params: PageParams }) {
  const { project } = params;
  const wiki = useMediaWiki(project);

  void getAllRevisions(wiki.action, {
    arvProp: ["content", "ids", "timestamp", "user", "userid", "parsedcomment", "size"],
    arvLimit: 50,
  });

  return null;
}
