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
  continue: {
    sroffset: number;
    continue: string;
  };
  query: T;
}

export interface ParseResponse {
  title: "définir";
  pageid: number;
  revid: number;
  text: {
    "*": string;
  };
  langlinks: {
    lang: string;
    url: string;
    langname: string;
    autonym: string;
    "*": string;
  }[];
  categories: {
    sortkey: string;
    "*": string;
  }[];
  links: {
    ns: Namespace;
    exists?: "";
    "*": string;
  }[];
  templates: {
    ns: Namespace;
    exists?: "";
    "*": string;
  }[];
  images: string[];
  externallinks: URI[];
  sections: {
    toclevel: number;
    level: `${number}`;
    line: string;
    number: `${number}` | `${number}.${number}` | string;
    index: `${number}`;
    fromtitle: string;
    byteoffset: number;
    anchor: string;
    linkAnchor: string;
  }[];
  showtoc: "";
  parsewarnings: [];
  displaytitle: string;
  iwlinks: {
    prefix: "w";
    url: string;
    "*": string;
  }[];
  properties: {
    name: string;
    "*": string;
  }[];
}

interface Options {
  [key: string]: string | number | boolean;
}

export function parse<T = ParseResponse>(host: string, options: Options) {
  return get<{ parse: T }>(host, { ...options, action: "parse" });
}

export function query<T = unknown>(host: string, options: Options) {
  return get<QueryResponse<T>>(host, { ...options, action: "query" });
}

export async function get<R = unknown>(host: string, options: Options) {
  const res = await fetch(
    `https://${host}/w/api.php?` + new URLSearchParams(options as any),
    {
      method: "GET",
      redirect: "follow",
    }
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const json = await res.json();

  if ("error" in json) {
    const error = new Error((json as APIError).error!.info) as Error & { code: string };
    error.code = json.error.code;
    throw error;
  }
  if ("warnings" in json) {
    console.warn(json.warnings[options.action as string] ?? json.warnings);
  }

  return json as R;
}

export function getHost(project: string, lang: string) {
  switch (project) {
    case "wiki":
    case "wikipedia":
      return `${lang}.wikipedia.org`;

    default:
      throw new Error(`Unknown project: ${project}`);
  }
}
