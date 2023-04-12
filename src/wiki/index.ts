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
  error: {
    code: string;
    info: string;
    "*": string;
  };
  servedby: string;
}

export interface ParseResponse {
  parse: {
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
  };
}

export async function get<R = unknown>(
  host: string,
  options: {
    [key: string]: string | number;
  }
) {
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
    const error = new Error((json as APIError).error.info) as Error & { code: string };
    error.code = json.error.code;
    throw error;
  }

  return json as R;
}
