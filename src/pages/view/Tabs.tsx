import { Tab, Tabs } from "@blueprintjs/core";
import { useMemo } from "react";
import { Link } from "~/utils/router";
import { useSiteInfo } from "~/wiki/hooks";
import { useArticleContext } from "./Context";

// https://en.wikipedia.org/wiki/Wikipedia:Namespace#Pseudo-namespaces
// [undefined, 'Talk', 'User', 'User talk', 'Project', 'Project talk', 'File', 'File talk', 'MediaWiki', 'MediaWiki talk', 'Template', 'Template talk', 'Help', 'Help talk', 'Category', 'Category talk', 'Portal', 'Portal talk', 'Draft', 'Draft talk', 'TimedText', 'TimedText talk', 'Module', 'Module talk', 'Gadget', 'Gadget talk', 'Gadget definition', 'Gadget definition talk', 'Media', 'Special']
const NS = {
  Main: undefined,
  Talk: "Talk",
  User: "User",
  UserTalk: "User talk",
  Project: "Project",
  ProjectTalk: "Project talk",
  File: "File",
  FileTalk: "File talk",
  MediaWiki: "MediaWiki",
  MediaWikiTalk: "MediaWiki talk",
  Template: "Template",
  TemplateTalk: "Template talk",
  Help: "Help",
  HelpTalk: "Help talk",
  Category: "Category",
  CategoryTalk: "Category talk",
  Portal: "Portal",
  PortalTalk: "Portal talk",
  Draft: "Draft",
  DraftTalk: "Draft talk",
  TimedText: "TimedText",
  TimedTextTalk: "TimedText talk",
  Module: "Module",
  ModuleTalk: "Module talk",
  Gadget: "Gadget",
  GadgetTalk: "Gadget talk",
  GadgetDefinition: "Gadget definition",
  GadgetDefinitionTalk: "Gadget definition talk",
  Media: "Media",
  Special: "Special",
};

const to = (href: string) => `./${href}`;

function useTabList(): {
  text: string;
  href: string;
  active?: boolean;
}[] {
  const { wiki, page } = useArticleContext();
  const { data: siteInfo } = useSiteInfo(wiki);

  const namespaceInfo = siteInfo?.namespaces;
  const nsMap = useMemo(
    () => new Map(Object.values(namespaceInfo ?? {}).map(_ => [_.canonical, _.name])),
    [namespaceInfo]
  );

  const ns = (namespace: string) => nsMap.get(namespace)!;

  const info = useMemo(() => {
    const colonIndex = page.indexOf(":");
    if (colonIndex === -1) {
      return {
        namespace: NS.Main,
        title: page,
      };
    } else {
      const namespaceName = page.slice(0, colonIndex);
      return {
        namespace: Object.values(namespaceInfo ?? {}).find(
          ({ name }) => name === namespaceName
        )?.canonical,
        title: page.slice(colonIndex + 1),
      };
    }
  }, [namespaceInfo, page]);

  if (!siteInfo) {
    return [];
  }

  switch (info.namespace) {
    case NS.Main:
      return [
        { text: "Article", href: to(`${page}`), active: true },
        { text: "Talk", href: to(`${ns(NS.Talk)}:${page}`) },
      ];

    case NS.Talk:
      return [
        { text: "Article", href: to(`${info.title}`) },
        { text: "Talk", href: to(`${page}`), active: true },
      ];

    case NS.User:
      return [
        { text: "User page", href: to(`${page}`), active: true },
        { text: "Talk", href: to(`${ns(NS.UserTalk)}:${info.title}`) },
        // { text: "Contributions", href: to(`${ns(NS.Special)}/Contributions/${info.title}`) },
      ];

    case NS.UserTalk:
      return [
        { text: "User page", href: to(`${ns(NS.User)}:${info.title}`) },
        { text: "Talk", href: to(`${page}`), active: true },
      ];

    default:
      return [];
  }
}

export function PageTabs() {
  const tabList = useTabList();
  if (!tabList.length) return null;

  return (
    <Tabs selectedTabId={tabList.findIndex(x => x.active)}>
      {tabList.map(({ text, href }, i) => (
        <Tab id={i} key={href}>
          <Link href={href}>{text}</Link>
        </Tab>
      ))}
    </Tabs>
  );
}
