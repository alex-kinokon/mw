import { Parser as HtmlParser, type ParserOptions } from "htmlparser2";
import {
  type ChildNode,
  type DataNode,
  DomHandler,
  type Element,
  isComment,
  isDirective,
  isText,
} from "domhandler";
import { camelCase } from "lodash";
import { createElement as c } from "react";

// html-to-react/lib/camel-case-attribute-names.js
const HTML_ATTRIBUTES = [
  "accept",
  "acceptCharset",
  "accessKey",
  "action",
  "allowFullScreen",
  "allowTransparency",
  "alt",
  "async",
  "autoComplete",
  "autoFocus",
  "autoPlay",
  "capture",
  "cellPadding",
  "cellSpacing",
  "challenge",
  "charSet",
  "checked",
  "cite",
  "classID",
  "className",
  "colSpan",
  "cols",
  "content",
  "contentEditable",
  "contextMenu",
  "controls",
  "coords",
  "crossOrigin",
  "data",
  "dateTime",
  "default",
  "defer",
  "dir",
  "disabled",
  "download",
  "draggable",
  "encType",
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "frameBorder",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hrefLang",
  "htmlFor",
  "httpEquiv",
  "icon",
  "id",
  "inputMode",
  "integrity",
  "is",
  "keyParams",
  "keyType",
  "kind",
  "label",
  "lang",
  "list",
  "loop",
  "low",
  "manifest",
  "marginHeight",
  "marginWidth",
  "max",
  "maxLength",
  "media",
  "mediaGroup",
  "method",
  "min",
  "minLength",
  "multiple",
  "muted",
  "name",
  "noValidate",
  "nonce",
  "open",
  "optimum",
  "pattern",
  "placeholder",
  "poster",
  "preload",
  "profile",
  "radioGroup",
  "readOnly",
  "rel",
  "required",
  "reversed",
  "role",
  "rowSpan",
  "rows",
  "sandbox",
  "scope",
  "scoped",
  "scrolling",
  "seamless",
  "selected",
  "shape",
  "size",
  "sizes",
  "span",
  "spellCheck",
  "src",
  "srcDoc",
  "srcLang",
  "srcSet",
  "start",
  "step",
  "style",
  "summary",
  "tabIndex",
  "target",
  "title",
  "type",
  "useMap",
  "value",
  "width",
  "wmode",
  "wrap",
  "onClick",
];
const NON_STANDARD_ATTRIBUTES = [
  "autoCapitalize",
  "autoCorrect",
  "color",
  "itemProp",
  "itemScope",
  "itemType",
  "itemRef",
  "itemID",
  "security",
  "unselectable",
  "results",
  "autoSave",
];
const SVG_ATTRIBUTES = [
  "accentHeight",
  "accumulate",
  "additive",
  "alignmentBaseline",
  "allowReorder",
  "alphabetic",
  "amplitude",
  "arabicForm",
  "ascent",
  "attributeName",
  "attributeType",
  "autoReverse",
  "azimuth",
  "baseFrequency",
  "baseProfile",
  "baselineShift",
  "bbox",
  "begin",
  "bias",
  "by",
  "calcMode",
  "capHeight",
  "clip",
  "clipPath",
  "clipPathUnits",
  "clipRule",
  "colorInterpolation",
  "colorInterpolationFilters",
  "colorProfile",
  "colorRendering",
  "contentScriptType",
  "contentStyleType",
  "cursor",
  "cx",
  "cy",
  "d",
  "decelerate",
  "descent",
  "diffuseConstant",
  "direction",
  "display",
  "divisor",
  "dominantBaseline",
  "dur",
  "dx",
  "dy",
  "edgeMode",
  "elevation",
  "enableBackground",
  "end",
  "exponent",
  "externalResourcesRequired",
  "fill",
  "fillOpacity",
  "fillRule",
  "filter",
  "filterRes",
  "filterUnits",
  "floodColor",
  "floodOpacity",
  "focusable",
  "fontFamily",
  "fontSize",
  "fontSizeAdjust",
  "fontStretch",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "format",
  "from",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyphName",
  "glyphOrientationHorizontal",
  "glyphOrientationVertical",
  "glyphRef",
  "gradientTransform",
  "gradientUnits",
  "hanging",
  "horizAdvX",
  "horizOriginX",
  "ideographic",
  "imageRendering",
  "in",
  "in2",
  "intercept",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kernelMatrix",
  "kernelUnitLength",
  "kerning",
  "keyPoints",
  "keySplines",
  "keyTimes",
  "lengthAdjust",
  "letterSpacing",
  "lightingColor",
  "limitingConeAngle",
  "local",
  "markerEnd",
  "markerHeight",
  "markerMid",
  "markerStart",
  "markerUnits",
  "markerWidth",
  "mask",
  "maskContentUnits",
  "maskUnits",
  "mathematical",
  "mode",
  "numOctaves",
  "offset",
  "opacity",
  "operator",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "overlinePosition",
  "overlineThickness",
  "paintOrder",
  "panose1",
  "pathLength",
  "patternContentUnits",
  "patternTransform",
  "patternUnits",
  "pointerEvents",
  "points",
  "pointsAtX",
  "pointsAtY",
  "pointsAtZ",
  "preserveAlpha",
  "preserveAspectRatio",
  "primitiveUnits",
  "r",
  "radius",
  "refX",
  "refY",
  "renderingIntent",
  "repeatCount",
  "repeatDur",
  "requiredExtensions",
  "requiredFeatures",
  "restart",
  "result",
  "rotate",
  "rx",
  "ry",
  "scale",
  "seed",
  "shapeRendering",
  "slope",
  "spacing",
  "specularConstant",
  "specularExponent",
  "speed",
  "spreadMethod",
  "startOffset",
  "stdDeviation",
  "stemh",
  "stemv",
  "stitchTiles",
  "stopColor",
  "stopOpacity",
  "strikethroughPosition",
  "strikethroughThickness",
  "string",
  "stroke",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
  "surfaceScale",
  "systemLanguage",
  "tableValues",
  "targetX",
  "targetY",
  "textAnchor",
  "textDecoration",
  "textLength",
  "textRendering",
  "to",
  "transform",
  "u1",
  "u2",
  "underlinePosition",
  "underlineThickness",
  "unicode",
  "unicodeBidi",
  "unicodeRange",
  "unitsPerEm",
  "vAlphabetic",
  "vHanging",
  "vIdeographic",
  "vMathematical",
  "values",
  "vectorEffect",
  "version",
  "vertAdvY",
  "vertOriginX",
  "vertOriginY",
  "viewBox",
  "viewTarget",
  "visibility",
  "widths",
  "wordSpacing",
  "writingMode",
  "x",
  "x1",
  "x2",
  "xChannelSelector",
  "xHeight",
  "xlinkActuate",
  "xlinkArcrole",
  "xlinkHref",
  "xlinkRole",
  "xlinkShow",
  "xlinkTitle",
  "xlinkType",
  "xmlns",
  "xmlnsXlink",
  "xmlBase",
  "xmlLang",
  "xmlSpace",
  "y",
  "y1",
  "y2",
  "yChannelSelector",
  "z",
  "zoomAndPan",
];
const camelCaseMap = new Map<string, string>();

for (const attr of [...HTML_ATTRIBUTES, ...NON_STANDARD_ATTRIBUTES, ...SVG_ATTRIBUTES]) {
  const lower = attr.toLowerCase();
  if (lower !== attr) {
    camelCaseMap.set(lower, attr);
  }
}

// html-to-react/lib/utils.js
function createStyleJsonFromString(styleString = "") {
  const styles = styleString.split(/;(?!base64)/);
  const jsonStyles = {} as Record<string, string>;
  for (const style of styles) {
    const singleStyle = style.split(":");
    if (singleStyle.length > 2) {
      singleStyle[1] = singleStyle.slice(1).join(":");
    }
    let [key, value] = singleStyle;
    if (typeof value === "string") {
      value = value.trim();
    }
    if (key?.length && value?.length) {
      key = key.trim();
      if (!key.startsWith("--")) {
        key = camelCase(key);
      }
      jsonStyles[key] = value;
    }
  }
  return jsonStyles;
}

const booleanAttrs = /* @__PURE__ */ new Set([
  "allowFullScreen",
  "allowpaymentrequest",
  "async",
  "autoFocus",
  "autoPlay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formNoValidate",
  "hidden",
  "ismap",
  "itemScope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "noValidate",
  "open",
  "playsinline",
  "readOnly",
  "required",
  "reversed",
  "selected",
  "truespeed",
]);

function createElement(
  node: Element,
  index: number,
  data?: string,
  children?: React.ReactNode[]
): React.ReactElement {
  let elementProps: Record<string, unknown> = {
    key: index,
  };
  const isCustomElementNode = node.name.includes("-");
  if (node.attribs) {
    elementProps = Object.entries(node.attribs).reduce((result, [key, value]) => {
      let v = value as any;
      if (!isCustomElementNode) {
        key = camelCaseMap.get(key.replace(/[:-]/, "")) || key;
        if (key === "style") {
          v = createStyleJsonFromString(value);
        } else if (key === "class") {
          key = "className";
        } else if (key === "for") {
          key = "htmlFor";
        } else if (key.startsWith("on")) {
          // v = Function(value);
        }
        if (booleanAttrs.has(key) && (value || "") === "") {
          v = key;
        }
      }
      result[key] = v;
      return result;
    }, elementProps);
  }
  children = children || [];
  const allChildren = data != null ? [data, ...children] : children;
  return c(node.name, elementProps, ...allChildren);
}

// html-to-react/lib/process-node-definitions.js
const voidElementTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "menuitem",
  "textarea",
]);

// html-to-react/lib/processing-instructions.js
const defaultMiddleware: Middleware = {
  filter: () => true,
  onNode(node: ChildNode, children, index) {
    if (isText(node)) {
      return node.data;
    } else if (isComment(node)) {
      return false;
    }
    return voidElementTags.has((node as Element).name)
      ? createElement(node as Element, index)
      : createElement(node as Element, index, (node as DataNode).data, children);
  },
};

// html-to-react/lib/parser.js
function traverseDom(
  node: ChildNode,
  isValidNode: (node: ChildNode) => boolean,
  middleware: Middleware,
  preprocess: PreprocessingMiddleware | undefined,
  index: number
): React.ReactNode {
  if (!isValidNode(node)) {
    return false;
  }

  preprocess?.(node, index);

  if (!middleware.filter(node)) {
    return false;
  }

  const children = Array.from((node as Element).children || [])
    .map((child, i) => traverseDom(child, isValidNode, middleware, preprocess, i))
    .filter((child): child is React.ReactElement => child != null && child !== false);

  const processed = middleware.onNode(node, children, index);

  return middleware.replaceChildren
    ? createElement(node as Element, index, (node as DataNode).data, [processed])
    : processed!;
}

interface Middleware {
  replaceChildren?: boolean;
  filter(node: ChildNode): boolean;
  onNode(node: ChildNode, children: React.ReactElement[], index: number): React.ReactNode;
}
type PreprocessingMiddleware = (node: ChildNode, index: number) => void;

export class Html2ReactParser {
  constructor(readonly options: ParserOptions = {}) {}

  private parseHtmlToTree(html: string): ChildNode[] {
    const handler = new DomHandler();
    const parser = new HtmlParser(handler, {
      ...this.options,
      decodeEntities: true,
    });
    parser.parseComplete(html);
    return handler.dom.filter(element => !isDirective(element));
  }

  parseWithInstructions(
    html: string,
    isValidNode: (node: ChildNode) => boolean,
    processingInstruction: Middleware,
    preprocessingInstruction?: PreprocessingMiddleware
  ): React.ReactNode {
    const domTree = this.parseHtmlToTree(html);
    const list = domTree.map((domTreeItem, index) =>
      traverseDom(
        domTreeItem,
        isValidNode,
        processingInstruction,
        preprocessingInstruction,
        index
      )
    );
    return list.length <= 1 ? list[0] : list;
  }

  parse(html: string): React.ReactNode {
    return this.parseWithInstructions(html, () => true, defaultMiddleware);
  }
}
