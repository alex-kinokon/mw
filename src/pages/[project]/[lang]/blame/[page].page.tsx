import { useMediaWiki } from "~/pages/_utils";

interface PageParams {
  readonly project: string;
  readonly lang: string;
  readonly page: string;
}

export default function BlamePage({ params }: { params: PageParams }) {
  const { project, lang, page } = params;
  const wiki = useMediaWiki(project, lang);

  wiki.action.getAllRevisions({
    arvprop: ["content", "ids", "timestamp", "user", "userid", "parsedcomment", "size"],
    arvlimit: 50,
  });

  return null;
}
