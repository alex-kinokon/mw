#!/usr/bin/env bun
import fs from "node:fs/promises";
import { resolve } from "node:path";
import * as sass from "sass";
import type { Element } from "stylis";
import { compile, serialize, stringify } from "stylis";

// element types: "decl", "comm", "rule", "@media", "@import"
const whitelist = new Set([":root", ":root[data-theme=dark]"]);

function filter(elements: Element[]): Element[] {
  return elements.flatMap(e => {
    if (typeof e === "string") return [e];

    switch (e.type) {
      case "decl":
        return e;
      case "rule":
        // return e;
        return e.value.includes(".mw-parser-output") || whitelist.has(e.value) ? e : [];
      case "@media":
        return {
          ...e,
          children: filter(e.children as Element[]),
        };
      case "@import":
      case "@charset":
      case "comm":
        return [];
      default:
        throw new Error(`Unknown element type ${e.type}`);
    }
  });
}

function extractParserOutputCSS(cssString: string): string {
  return serialize(filter(compile(cssString)), stringify);
}

const path = resolve(__dirname, "../../mediawiki/stylesheet/index.scss");
console.log(path);

const sassResult = await sass.compileAsync(path, {
  sourceMap: false,
  functions: {
    "encode-uri-component($text)"(args) {
      const { text } = args[0].assertString();
      return new sass.SassString(encodeURIComponent(text));
    },
    "color-mode()"() {
      return new sass.SassString("data-theme");
    },
    "let($name)"(args) {
      const { text } = args[0].assertString();
      return new sass.SassString(`--mw-${text}`, { quotes: false });
    },
  },
});

const output = extractParserOutputCSS(sassResult.css);
await fs.writeFile(resolve(__dirname, "../src/assets/wiki.css"), output);
