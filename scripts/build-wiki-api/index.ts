#!/usr/bin/env bun
import fs from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";
import yaml from "yaml";
import { camelCase } from "lodash";
import { getJSON } from "./fetch";
import { getInterfaces, getModules } from "./build";

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const Hosts = {
  MediaWiki: "https://www.mediawiki.org/w/api.php",
  EnWiki: "https://en.wikipedia.org/w/api.php",
  Wikicommons: "https://commons.wikimedia.org/w/api.php",
  Test: "https://test.wikipedia.org/w/api.php",
};

const data = yaml.parse(
  fs.readFileSync(resolve(__dirname, "../wiki-routes.yml"), "utf-8")
);

const methodNameMap = new Map<string, string>(
  Object.entries(data.methodNameMap as Record<string, string>).map(
    ([key, value]) =>
      [key.toLowerCase(), value === null ? capitalize(key) : value] as const
  )
);

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
      camelizedName: camelCase(getNormalizedName(module)),
    })
  );
}

const modules = (await Promise.all(["main", "main+**"].map(getModuleDefinition)))
  .flat(1)
  .filter(m => !["json", "xml", "xmlfm"].includes(m.name) && !m.internal);

async function fromGenerator(code: Generator<string, void, unknown>) {
  let jsCode = Array.from(code).filter(Boolean).join("\n");
  try {
    jsCode = await format(jsCode, { parser: "babel-ts", printWidth: 90 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to format code", e.message);
  }
  return jsCode;
}

fs.mkdirSync("src/wiki/__generated__", { recursive: true });

await Promise.all(
  modules.map(async mod => {
    const jsCode = await fromGenerator(getModules(mod));
    const interfaceCode = await fromGenerator(getInterfaces(mod));
    fs.writeFileSync(
      `src/wiki/__generated__/${mod.camelizedName}.ts`,
      jsCode + interfaceCode
    );
  })
);

fs.writeFileSync(
  `src/wiki/actions.generated.ts`,
  modules.map(m => `export * from "./__generated__/${m.camelizedName}";`).join("\n")
);

interface ParamInfo {
  helpformat: "html";
  modules: Module[];
}

export interface Parameter {
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
  min?: number;
  max?: number;
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
  helpurls: string[];
  examples: {
    query: string;
    description: string;
  }[];
  parameters: Parameter[];
  templatedparameters: [];
}

export interface ModulePlus extends Module {
  normalizedName: string;
  camelizedName: string;
}
