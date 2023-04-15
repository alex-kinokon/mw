import { request } from "./api.complementary";

type URI = string;
type Namespace = number;

interface APIError {
  warning?: {
    jsonfm: {
      "*": string;
    };
    main: {
      "*": string;
    };
  };
  error?: {
    code: string;
    info: string;
    "*": string;
  };
  servedby: string;
}

export interface SearchResultItem {
  ns: Namespace;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  snippet: string;
  timestamp: string;
}

export interface SearchResponse {
  searchinfo: {
    totalhits: number;
  };
  search: SearchResultItem[];
}

export interface QueryResponse<T> {
  batchcomplete: "";
  continue?: {
    sroffset: number;
    continue: string;
  };
  query: T;
}

export interface ParseResponseSection {
  toclevel: number;
  level: `${number}`;
  line: string;
  number: `${number}` | `${number}.${number}` | string;
  index: `${number}`;
  fromtitle: string;
  byteoffset: number;
  anchor: string;
  linkAnchor: string;
  extensionData?: {
    "DiscussionTools-html-summary"?: string;
  };
}

export interface ParseResponse {
  pageid: number;
  revid: number;
  text: string;
  title: string;
  langlinks: {
    lang: string;
    url: string;
    langname: string;
    autonym: string;
    title: string;
  }[];
  categories: {
    sortkey: string;
    category: string;
    hidden?: boolean;
  }[];
  links: {
    ns: Namespace;
    exists?: boolean;
    title: string;
  }[];
  templates: {
    ns: Namespace;
    exists?: boolean;
    title: string;
  }[];
  images: string[];
  externallinks: URI[];
  sections: ParseResponseSection[];
  showtoc: boolean;
  parsewarnings: [];
  displaytitle: string;
  iwlinks: {
    prefix: string;
    url: string;
    title: string;
  }[];
  properties: {
    defaultsort: string;
    page_image_free: string;
    // [`wikibase-badge-${string}`]: boolean;
    "wikibase-shortdesc": string;
    wikibase_item: string;
  };
}

declare namespace SiteInfo {
  interface General {
    mainpage: string;
    base: string;
    sitename: string;
    mainpageisdomainroot: boolean;
    logo: string;
    generator: string;
    phpversion: string;
    phpsapi: string;
    dbtype: "mysql";
    dbversion: string;
    imagewhitelistenabled: boolean;
    langconversion: boolean;
    linkconversion: boolean;
    titleconversion: boolean;
    linkprefixcharset: string;
    linkprefix: string;
    linktrail: string;
    legaltitlechars: string;
    invalidusernamechars: string;
    allunicodefixes: boolean;
    fixarabicunicode: boolean;
    fixmalayalamunicode: boolean;
    "git-hash": string;
    "git-branch": string;
    case: "first-letter";
    lang: string;
    fallback: [];
    rtl: false;
    fallback8bitEncoding: "windows-1252";
    readonly: false;
    writeapi: boolean;
    maxarticlesize: 2097152;
    timezone: "UTC";
    timeoffset: 0;
    articlepath: string;
    scriptpath: string;
    script: string;
    variantarticlepath: boolean;
    server: string;
    servername: string;
    wikiid: string;
    time: string;
    misermode: boolean;
    uploadsenabled: boolean;
    maxuploadsize: number;
    minuploadchunksize: number;
    galleryoptions: {
      imagesPerRow: number;
      imageWidth: number;
      imageHeight: number;
      captionLength: boolean;
      showBytes: boolean;
      mode: string;
      showDimensions: boolean;
    };
    thumblimits: {
      [index: string]: number;
    };
    imagelimits: {
      [index: string]: {
        width: 320;
        height: 240;
      };
    };
    favicon: string;
    centralidlookupprovider: string;
    allcentralidlookupproviders: string[];
    interwikimagic: boolean;
    magiclinks: {
      ISBN: boolean;
      PMID: boolean;
      RFC: boolean;
    };
    categorycollation: string;
    nofollowlinks: boolean;
    nofollownsexceptions: unknown[];
    nofollowdomainexceptions: string[];
    externallinktarget: boolean;
    "wmf-config": {
      wmfMasterDatacenter: string;
      wmfEtcdLastModifiedIndex: number;
      wmgCirrusSearchDefaultCluster: string;
      wgCirrusSearchDefaultCluster: string;
    };
    extensiondistributor: {
      snapshots: string[];
      list: "";
    };
    mobileserver: string;
    "readinglists-config": {
      maxListsPerUser: number;
      maxEntriesPerList: number;
      deletedRetentionDays: number;
    };
    citeresponsivereferences: boolean;
    linter: {
      high: string[];
      medium: string[];
      low: string[];
    };
    "pageviewservice-supported-metrics": {
      pageviews: {
        pageviews: boolean;
        uniques: boolean;
      };
      siteviews: {
        pageviews: boolean;
        uniques: boolean;
      };
      mostviewed: {
        pageviews: boolean;
        uniques: boolean;
      };
    };
  }

  interface Namespace {
    [number: string]: {
      id: number;
      case: "first-letter";
      name: string;
      subpages: boolean;
      canonical: string;
      content: boolean;
      nonincludable: boolean;
      namespaceprotection?: "editinterface";
      defaultcontentmodel?: "GadgetDefinition";
    };
  }

  interface NamespaceAliases {
    id: number;
    alias: "Image";
  }
}

interface Options {
  [key: string]: string | number | boolean | string[];
}

export class MediaWiki {
  constructor(readonly host: string) {}

  parse<T = unknown>(options: Options) {
    return this.get<{ parse: T }>("GET", {
      ...options,
      action: "parse",
      formatVersion: 2,
    });
  }

  query<T = unknown>(options: Options) {
    return this.get<QueryResponse<T>>("GET", { ...options, action: "query" });
  }

  async siteInfo() {
    // https://www.mediawiki.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases
    return await this.query<{
      general: SiteInfo.General;
      namespaces: SiteInfo.Namespace;
      namespacealiases: SiteInfo.NamespaceAliases[];
    }>({
      meta: "siteinfo",
      siProp: ["general", "namespaces", "namespaceAliases"].map(lower),
      format: "json",
      formatVersion: 2,
      origin: "*",
    });
  }

  async get<R = unknown>(method: "GET" | "POST", options: Options) {
    return await request<R>(`https://${this.host}/w/api.php`, method, options);
  }
}

const lower = (str: string) => str.toLowerCase();

export function getHost(project: string, lang: string) {
  switch (project) {
    case "wiki":
    case "wikipedia":
      return `${lang}.wikipedia.org`;

    default:
      throw new Error(`Unknown project: ${project}`);
  }
}
