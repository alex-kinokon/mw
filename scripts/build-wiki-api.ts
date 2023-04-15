#!/usr/bin/env -S node -r esbuild-register
import fs from "fs";
import { resolve } from "path";
import { format } from "prettier";
import { camelCase } from "lodash";
import { NodeHtmlMarkdown } from "node-html-markdown";

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ {
    var: { prefix: "`", postfix: "`" },
    kbd: { prefix: "`", postfix: "`" },
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

async function getModuleDefinition(module: string) {
  const json = await getJSON<{ paraminfo: ParamInfo }>(Hosts.MediaWiki, {
    action: "paraminfo",
    format: "json",
    formatVersion: 2,
    modules: module,
    helpFormat: "html",
    useLang: "en",
  });
  return json.paraminfo.modules[0];
}

async function main() {
  const modules = await Promise.all(["paraminfo", "main"].map(getModuleDefinition));
  let code = Array.from(getModules(modules)).filter(Boolean).join("\n");
  try {
    code = format(code, { parser: "babel-ts" });
  } catch {}

  fs.writeFileSync("src/wiki/api.ts", code);
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
    return type.map(getType).join(" | ");
  }

  switch (type) {
    case "string":
      return "string";
    default:
      return JSON.stringify(type);
  }
}

function* getModules(modules: ParamInfo["modules"]) {
  yield `
    /** spellchecker:disable */
    import { request } from "./api.complementary";

    export class API {
      constructor(private endpoint: string) {}
    `;

  for (const _ of modules) {
    yield* yieldComment(_.description);
    yield camelCase(_.classname.replace(/Api/, ""));
    yield `(params: ${_.classname}.Params) {`;
    yield `  return request(this.endpoint, "GET", { format: "json", action: "${_.name}", ...params });`;
    yield "}";
    // yield _.name;
  }

  yield "}";
  yield "\n";

  for (const _ of modules) {
    yield "";
    yield* yieldComment(_.description);
    yield "declare namespace " + _.classname + " {";
    yield `
    /**
     * Query parameters for \`${_.name}\` module.
     * @see https://www.mediawiki.org/w/api.php?action=help&modules=${_.name}
     */`;
    yield "interface Params {";
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
      yield p.name + (p.required ? "" : "?");
      yield ": (";
      yield getType(p.type);
      yield ")" + (p.multi ? "[]" : "");
      yield "\n";
    }
    yield "}";

    yield "}";
  }
}

main();

interface ParamInfo {
  helpformat: "html";
  modules: {
    name: string;
    classname: string;
    path: string;
    prefix: string;
    source: string;
    sourcename: string;
    licensetag: "GPL-2.0-or-later";
    licenselink: string;
    description: string;
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
  }[];
}
