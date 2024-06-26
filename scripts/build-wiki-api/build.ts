/* eslint-disable unicorn/string-content */
import fs from "node:fs";
import { resolve } from "node:path";
import yaml from "yaml";
import { isIdentifierName, isKeyword } from "@babel/helper-validator-identifier";
import { camelCase } from "lodash";
import { nhm } from "./markdown";
import type { ModulePlus, Parameter } from "./index";

const socialize = (str: string) => str[0].toLowerCase() + str.slice(1);

const data = yaml.parse(
  fs.readFileSync(resolve(__dirname, "../wiki-routes.yml"), "utf-8")
);

const paramNameMap = new Map<string, string>(
  (data.params as string[]).map(param => [param.toLowerCase(), param] as const)
);
const complementary = fs.readFileSync("src/wiki/utils.ts", "utf-8");
const stringify = (value: unknown) => JSON.stringify(value);

const wrap = wordwrap(4, 80);
function* yieldComment(comment: string, close = true) {
  yield "/**";
  for (const line of wrap(nhm.translate(comment))) {
    yield ` * ${line}`;
  }
  if (close) {
    yield " */";
  }
}

function getType(p: Parameter, type: string | string[] = p.type, isTop = true): string {
  if (Array.isArray(type)) {
    return type.length ? type.map(t => getType(p, t, false)).join(" | ") : "any";
  }
  if (p.min) {
    return "number";
  }

  switch (type) {
    case "string":
    case "boolean":
      return type;
    case "integer":
      return "number";
    case "timestamp":
      return isTop ? "string" : stringify(type);
    default:
      return stringify(type);
  }
}

const propName = (str: string) =>
  isIdentifierName(str) ? `.${str}` : `[${stringify(str)}]`;

function parseParamValue(value: string) {
  return value.includes("|")
    ? "[" + value.split("|").map(stringify).join(", ") + "]"
    : JSON.stringify(value);
}

export function* getModules(_: ModulePlus) {
  yield /* js */ `
    /* spellchecker: disable */
    import type { APIRequester } from "../action";
  `;

  const name = _.normalizedName;
  const paths = _.path.split("+");
  const props =
    paths.length > 1
      ? `action: "${paths[0]}", ${_.group}: "${paths[1]}"`
      : `action: "${_.name}"`;
  const verb = _.mustbeposted ? "POST" : "GET";

  yield* yieldComment(_.description, false);
  if (_.deprecated) {
    yield ` * @deprecated`;
  }
  yield ` * @method ${verb}`;
  yield ` * @see https://www.mediawiki.org/w/api.php?action=help&modules=${_.path}`;

  let fnName = socialize(name);

  const nameAlias = new Map<string, string>();
  for (const { name } of _.parameters) {
    nameAlias.set(_.prefix + name, camelCase(_.prefix + "_" + name));
  }

  for (const e of _.examples) {
    yield " *";
    yield ` * @example`;
    yield ` * // ${e.description}.`;
    const param = Array.from(new URLSearchParams(e.query))
      .filter(([key]) => key !== "action" && key !== _.group)
      .map(
        ([key, value]) =>
          `${paramNameMap.get(key) ?? nameAlias.get(key) ?? key}: ` +
          parseParamValue(value)
      )
      .join(", ");
    yield ` * ${fnName}(${param ? `{ ${param} }` : ""});`;
  }
  yield " */";

  const responseName = `${name}Response`;
  const hasTypeDefinition = complementary.includes(responseName);

  yield "export";

  if (!isIdentifierName(fnName) || isKeyword(fnName)) {
    fnName = "_" + fnName.replace(/[^\dA-Za-z]/g, "_");
    yield `{ ${fnName} as ${socialize(name)} }`;
  }
  yield `async function ${fnName}`;
  if (!hasTypeDefinition) {
    yield "<R = any>";
  }

  yield /* ts */ `(
      api: APIRequester,
      params: ${name}Params
    ): Promise<${hasTypeDefinition ? responseName : "R"}> {
      const json = await api("${verb}", { ${props}, ...params });
      return json${paths.length > 1 ? propName(paths[0]) : propName(_.name)};
    }
  `;
}

export function* getInterfaces(_: ModulePlus) {
  yield _.normalizedName !== "GetMain"
    ? `import type { GetMainParams } from "./getMain";`
    : "export";
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
      yield `  * @default ${
        typeof p.default === "string" ? parseParamValue(p.default) : p.default
      }`;
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
    let name = camelCase(_.prefix + "_" + (paramNameMap.get(p.name) ?? p.name));
    if (paramNameMap.has(name)) {
      name = paramNameMap.get(name)!;
    }

    yield '"' + name + '"' + (p.required ? "" : "?");
    yield p.multi ? ": readonly (" : ": (";
    yield getType(p);
    yield ")" + (p.multi ? "[]" : "");
    yield "\n";
  }
  yield "}";
}

// wordwrap
// MIT License. https://github.com/substack/node-wordwrap#readme
/**
 * In "soft" mode, split chunks by `/(\S+\s+/` and don't break up chunks
 * which are longer than `stop - start`, in "hard" mode, split chunks with
 * `/\b/` and break up chunks longer than `stop - start`.
 */
type WordWrapMode = "soft" | "hard";

function wordwrap(start = 0, stop: number, mode: WordWrapMode = "soft") {
  const re = mode === "hard" ? /\b/ : /(\S+\s+)/;

  return function (text: string) {
    const chunks: string[] = [];
    for (const x of text.toString().split(re)) {
      if (mode === "hard") {
        for (let i = 0; i < x.length; i += stop - start) {
          chunks.push(x.slice(i, i + stop - start));
        }
      } else {
        chunks.push(x);
      }
      continue;
    }

    const lines: string[] = [new Array(start + 1).join(" ")];

    for (const rawChunk of chunks) {
      if (rawChunk === "") {
        continue;
      }

      const chunk = rawChunk.replace(/\t/g, "    ");

      const i = lines.length - 1;
      if (lines[i].length + chunk.length > stop) {
        lines[i] = lines[i].replace(/\s+$/, "");

        for (const c of chunk.split(/\n/)) {
          lines.push(new Array(start + 1).join(" ") + c.replace(/^\s+/, ""));
        }
      } else if (/\n/.test(chunk)) {
        const xs = chunk.split(/\n/);
        lines[i] += xs.shift();
        for (const c of xs) {
          lines.push(new Array(start + 1).join(" ") + c.replace(/^\s+/, ""));
        }
      } else {
        lines[i] += chunk;
      }

      continue;
    }

    return lines;
  };
}
