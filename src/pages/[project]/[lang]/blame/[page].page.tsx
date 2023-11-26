import { useMediaWiki } from "~/pages/_utils";
import { getAllRevisions } from "~/wiki/actions.generated";

interface PageParams {
  readonly project: string;
  readonly lang: string;
  readonly page: string;
}

export default function BlamePage({ params }: { params: PageParams }) {
  const { project, lang, page } = params;
  const wiki = useMediaWiki(project, lang);

  void getAllRevisions(wiki.action, {
    arvProp: ["content", "ids", "timestamp", "user", "userid", "parsedcomment", "size"],
    arvLimit: 50,
  });

  return null;
}
