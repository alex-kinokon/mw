#!/usr/bin/env bun
import fs from "fs";
import { resolve } from "path";
import { format } from "prettier";
import yaml from "yaml";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { camelCase } from "lodash";

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);
const uncapitalize = (str: string) => str[0].toLowerCase() + str.slice(1);

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ {
    var: { prefix: "`", postfix: "`" },
    kbd: { prefix: "`", postfix: "`" },
    dl({ node }) {
      const arr: { dt: Node[]; dd: Node }[] = [];
      let currentDtNodes: Node[] = [];

      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i] as Node & { rawTagName?: string };

        if (childNode.rawTagName === "dt") {
          // We've found a new <dt> element, so create a new array for its nodes
          currentDtNodes = [childNode];
        } else if (childNode.rawTagName === "dd") {
          // We've found a <dd> element, so add it to the array along with the current <dt> nodes
          arr.push({ dt: currentDtNodes, dd: childNode });
        } else if (childNode.textContent?.trim()) {
          // This is a text node or some other element, so add it to the current <dt> nodes
          currentDtNodes.push(childNode);
        }
      }

      const markdownList: string = arr
        .map(({ dt, dd }) => {
          const dtMarkdown = dt
            .map(d => nhm.translate(d.textContent!))
            .map(name => "`" + name + "`")
            .join(", ");
          const ddMarkdown = nhm.translate(dd.textContent!);
          return `* ${dtMarkdown}: ${ddMarkdown}`;
        })
        .join("\n");

      return {
        content: markdownList,
      };
    },
  },
  /* customCodeBlockTranslators (optional) */ undefined
);

const Cache = {
  resolve(url: string) {
    return resolve(__dirname, "../.cache", encodeURIComponent(url));
  },
  has(url: string) {
    return fs.existsSync(Cache.resolve(url));
  },
  get(url: string): Record<string, any> | undefined {
    if (Cache.has(url)) {
      const path = Cache.resolve(url);
      return JSON.parse(fs.readFileSync(path, "utf-8"));
    }
  },
  set(url: string, data: Record<string, any>) {
    fs.writeFileSync(Cache.resolve(url), JSON.stringify(data, null, 2));
    return data;
  },
};

async function getJSON<T = any>(host: string, options: Record<string, any>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    params.append(key.toLowerCase(), value);
  }

  const url = `${host}?${params}`;

  if (Cache.has(url)) {
    return Cache.get(url) as T;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const result = (await res.json()) as T;
  Cache.set(url, result as any);
  return result;
}

const Hosts = {
  MediaWiki: "https://www.mediawiki.org/w/api.php",
  EnWiki: "https://en.wikipedia.org/w/api.php",
  Wikicommons: "https://commons.wikimedia.org/w/api.php",
  Test: "https://test.wikipedia.org/w/api.php",
};

const data = yaml.parse(fs.readFileSync(resolve(__dirname, "wiki-routes.yml"), "utf-8"));
const methodNameMap = new Map<string, string>(
  Object.entries(data.methodNameMap as Record<string, string>).map(
    ([key, value]) =>
      [key.toLowerCase(), value === null ? capitalize(key) : value] as const
  )
);
const complementary = fs.readFileSync("src/wiki/utils.ts", "utf-8");

const nameMap = new Map(
  (data.routes as string[]).map(name => [name.toLowerCase(), name])
);

function getNormalizedName(module: Module) {
  const { name, classname } = module;
  if (methodNameMap.has(module.path)) {
    return methodNameMap.get(module.path)!;
  }

  let res = name;
  if (nameMap.has(name)) {
    res = nameMap.get(name)!;
  } else {
    const index = classname.toUpperCase().indexOf(name.toUpperCase());
    if (name.includes("-")) {
      res = camelCase(name);
    } else if (index === -1) {
      res = name;
    } else {
      res = classname.slice(index, index + name.length);
    }
  }

  res = camelCase(module.mustbeposted ? `set_${res}` : `get_${res}`)
    .replace("getGet", "get")
    .replace("setSet", "set");

  return capitalize(res);
}

interface ModulePlus extends Module {
  normalizedName: string;
}

async function getModuleDefinition(module: string): Promise<ModulePlus[]> {
  const json = await getJSON<{ paraminfo: ParamInfo }>(Hosts.MediaWiki, {
    action: "paraminfo",
    format: "json",
    formatVersion: 2,
    modules: module,
    helpFormat: "html",
    useLang: "en",
  });
  return json.paraminfo.modules.map(
    (module): ModulePlus => ({
      ...module,
      normalizedName: getNormalizedName(module),
    })
  );
}

function* yieldComment(comment: string, close = true) {
  yield "/**";
  for (const line of nhm.translate(comment).split("\n")) {
    yield ` * ${line}`;
  }
  if (close) {
    yield " */";
  }
}

function getType(type: string | string[]): string {
  if (Array.isArray(type)) {
    return type.length ? type.map(getType).join(" | ") : "any";
  }

  switch (type) {
    case "string":
    case "boolean":
      return type;
    case "integer":
      return "number";
    case "timestamp":
      return "string";
    default:
      return JSON.stringify(type);
  }
}

function* getModules(modules: ModulePlus[]) {
  yield /* js */ `
    /** spellchecker:disable */
    import { requestJSON } from "./utils";

    export class ActionAPI {
      constructor(private endpoint: string) {}

      protected async json<T = unknown>(method: "GET" | "POST", params: any) {
        return requestJSON<T>("https://" + this.endpoint + "/w/api.php", method, {
          format: "json",
          formatVersion: 2,
          ...params,
        });
      }
      
      protected async get<T = unknown>(params: any) {
        return this.json<T>("GET", params);
      }

      protected async post<T = unknown>(params: any) {
        return this.json<T>("POST", params);
      }
    `;
  // `}}`

  for (const _ of modules) {
    const name = _.normalizedName;
    const paths = _.path.split("+");
    const props =
      paths.length > 1
        ? `action: "${paths[0]}", ${_.group}: "${paths[1]}"`
        : `action: "${_.name}"`;
    const verb = _.mustbeposted ? "post" : "get";

    yield* yieldComment(_.description, false);
    if (_.deprecated) {
      yield ` * @deprecated`;
    }
    yield ` * @method ${_.mustbeposted ? "POST" : "GET"}`;
    yield ` * @see https://www.mediawiki.org/w/api.php?action=help&modules=${_.path}`;
    yield " */";

    const responseName = `${name}Response`;
    const hasTypeDefinition = complementary.includes(responseName);
    if (hasTypeDefinition) {
      yield `${uncapitalize(name)}(`;
    } else {
      yield `${uncapitalize(name)}<R = any>(`;
    }

    yield `params: ${name}Params): `;
    if (hasTypeDefinition) {
      yield `Promise<${responseName}>`;
    } else {
      yield `Promise<R>`;
    }

    yield `{
        return this.${verb}({ ${props}, ...params })
      }
    `;
    // yield _.name;
  }

  yield "}";
  yield "\n";

  for (const _ of modules) {
    yield "";
    yield `
    /**
     * Query parameters for \`${_.name}\` module.
     */`;
    yield `interface ${_.normalizedName}Params `;
    if (_.normalizedName !== "GetMain") {
      yield `extends GetMainParams `;
    }
    yield `{`;
    for (const p of _.parameters) {
      yield* yieldComment(p.description, false);
      if (p.deprecated) {
        yield "  * @deprecated";
      }
      if (p.default) {
        yield `  * @default ${p.default}`;
      }
      if (p.limit) {
        yield `  * @limit ${p.limit}`;
      }
      if (p.lowlimit) {
        yield `  * @min ${p.lowlimit}`;
      }
      if (p.highlimit) {
        yield `  * @max ${p.highlimit}`;
      }
      yield " */";
      yield '"' + _.prefix + p.name + '"' + (p.required ? "" : "?");
      yield p.multi ? ": readonly (" : ": (";
      yield getType(p.type);
      yield ")" + (p.multi ? "[]" : "");
      yield "\n";
    }
    yield "}";
  }
}

const modules = await Promise.all(["main", "main+**"].map(getModuleDefinition));

let code = Array.from(
  getModules(
    modules.flat(1).filter(m => !["json", "xml", "xmlfm"].includes(m.name) && !m.internal)
  )
)
  .filter(Boolean)
  .join("\n");
try {
  code = await format(code, {
    parser: "babel-ts",
    printWidth: 90,
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("Failed to format code", e.message);
}

fs.writeFileSync("src/wiki/actions.generated.ts", code);

interface ParamInfo {
  helpformat: "html";
  modules: Module[];
}

interface Module {
  name: string;
  classname: string;
  path: string;
  prefix: string;
  source: string;
  sourcename: string;
  group?: string;
  licensetag: "GPL-2.0-or-later";
  licenselink: string;
  description: string;
  internal: boolean;
  readrights: boolean;
  writerights: boolean;
  deprecated: boolean;
  mustbeposted: boolean;
  helpurls: [];
  examples: {
    query: string;
    description: string;
  }[];
  parameters: {
    default?: string;
    deprecated?: boolean;
    description: string;
    index: number;
    internalvalues?: string[];
    multi?: boolean;
    name: string;
    sensitive?: "";
    submodules: { [key: string]: string };
    subtypes?: string[];
    type: string | string[];
    required: boolean;
    limit?: number;
    lowlimit?: number;
    highlimit?: number;
  }[];
  templatedparameters: [];
}
