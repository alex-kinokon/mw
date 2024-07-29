import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import type { Plugin } from "vite";
import selectAll, { selectOne } from "css-select";
import serialize from "dom-serializer";
import { parseDocument } from "htmlparser2";
import svgToDataUri from "mini-svg-data-uri";
import { SassMap, SassString, type Value } from "sass";

const require = createRequire(import.meta.url);
const base = dirname(require.resolve("@blueprintjs/icons/lib/cjs/index.js"));

const __dirname = dirname(import.meta.url);

/**
 * The SVG inliner function.
 * This is a factory that expects a base path and returns the actual function.
 */
function sassSvgInlinerFactory(args: Value[]): SassString {
  args = Array.isArray(args) ? args : [args];
  const path = args[0] as SassString;
  const selectors = args[1] as SassMap | undefined;

  const [, size, name] = (path.text ?? (path as any).dartValue.text).match(
    /^(\d+)px\/(.+)\.svg$/
  )!;
  const js = require(resolve(base, "generated", `${size}px/paths/${name}.js`)).default;
  let svgContents = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${js}</svg>`;

  if (selectors?.asList.size) {
    svgContents = changeStyle(svgContents, selectors);
  }

  return new SassString(`url("${svgToDataUri(svgContents.toString())}")`, {
    quotes: false,
  });
}

/**
 * Change the style attributes of an SVG string.
 */
function changeStyle(source: string, selectorsMap: SassMap) {
  const document = parseDocument(source, { xmlMode: true });
  const svg = document ? selectOne("svg", document.childNodes) : null;

  const selectors = mapToObj(selectorsMap);
  for (const selector of Object.keys(selectors)) {
    const elements = selectAll(selector, svg);
    const newAttributes = selectors[selector];

    for (const element of elements) {
      // @ts-ignore -- attribs property does exist
      Object.assign(element.attribs, newAttributes);
    }
  }

  return serialize(document);
}

/**
 * Recursively transforms a Sass map into a JS object.
 */
function mapToObj(sassMap: SassMap) {
  const obj: Record<any, any> = Object.create(null);
  const map = sassMap.contents.toJS();

  for (const [key, value] of Object.entries(map) as [string, Value][]) {
    obj[key] = value instanceof SassMap ? mapToObj(value) : value.toString();
  }

  return obj;
}

// https://github.com/palantir/blueprint/issues/6051
export const fixBlueprint: Plugin = {
  name: "blueprint-fix",
  config(config) {
    config.resolve!.mainFields = ["esnext", "browser", "module", "jsnext:main", "jsnext"];
  },
  configResolved(config) {
    const scss = ((config.css.preprocessorOptions ??= {}).scss ??= {});
    scss.loadPaths = resolve(__dirname, "../node_modules");
    scss.functions = {
      /**
       * Sass function to inline a UI icon svg and change its path color.
       *
       * Usage:
       * svg-icon("16px/icon-name.svg", (path: (fill: $color)) )
       */
      "svg-icon($path, $selectors: null)": sassSvgInlinerFactory,
    };
  },
};
