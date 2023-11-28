// html-to-react/lib/parser.js
import { Parser as HtmlParser } from "htmlparser2";
import { DomHandler } from "domhandler";

// html-to-react/lib/should-process-node-definitions.js
function shouldProcessEveryNode(node) {
  return true;
}

// html-to-react/lib/utils.js
import { camelCase } from "lodash";
import { createElement as c } from "react";

// html-to-react/lib/camel-case-attribute-names.js
var HTML_ATTRIBUTES = [
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
var NON_STANDARD_ATTRIBUTES = [
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
var SVG_ATTRIBUTES = [
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
var camelCaseMap = HTML_ATTRIBUTES.concat(NON_STANDARD_ATTRIBUTES)
  .concat(SVG_ATTRIBUTES)
  .reduce((soFar, attr) => {
    const lower = attr.toLowerCase();
    if (lower !== attr) {
      soFar[lower] = attr;
    }
    return soFar;
  }, {});

// html-to-react/lib/utils.js
function createStyleJsonFromString(styleString = "") {
  const styles = styleString.split(/;(?!base64)/);
  let singleStyle;
  let key;
  let value;
  const jsonStyles = {};
  for (const style of styles) {
    singleStyle = style.split(":");
    if (singleStyle.length > 2) {
      singleStyle[1] = singleStyle.slice(1).join(":");
    }
    key = singleStyle[0];
    value = singleStyle[1];
    if (typeof value === "string") {
      value = value.trim();
    }
    if (key != null && value != null && key.length > 0 && value.length > 0) {
      key = key.trim();
      if (key.indexOf("--") !== 0) {
        key = camelCase(key);
      }
      jsonStyles[key] = value;
    }
  }
  return jsonStyles;
}
var booleanAttrs = /* @__PURE__ */ new Set([
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
function createElement(node, index, data, children) {
  let elementProps = {
    key: index,
  };
  const isCustomElementNode = node.name.includes("-");
  if (node.attribs) {
    elementProps = Object.entries(node.attribs).reduce((result, [key, value]) => {
      if (!isCustomElementNode) {
        key = camelCaseMap[key.replace(/[:-]/, "")] || key;
        if (key === "style") {
          value = createStyleJsonFromString(value);
        } else if (key === "class") {
          key = "className";
        } else if (key === "for") {
          key = "htmlFor";
        } else if (key.startsWith("on")) {
          value = Function(value);
        }
        if (booleanAttrs.has(key) && (value || "") === "") {
          value = key;
        }
      }
      result[key] = value;
      return result;
    }, elementProps);
  }
  children = children || [];
  const allChildren = data != null ? [data].concat(children) : children;
  return c(node.name, elementProps, ...allChildren);
}

// html-to-react/lib/process-node-definitions.js
var voidElementTags = [
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
];
function processDefaultNode(node, children, index) {
  if (node.type === "text") {
    return node.data;
  } else if (node.type === "comment") {
    return false;
  }
  return voidElementTags.includes(node.name)
    ? createElement(node, index)
    : createElement(node, index, node.data, children);
}

// html-to-react/lib/processing-instructions.js
var defaultProcessingInstructions = [
  {
    shouldProcessNode: shouldProcessEveryNode,
    processNode: processDefaultNode,
  },
];

// html-to-react/lib/is-valid-node-definitions.js
function alwaysValid() {
  return true;
}

// html-to-react/lib/parser.js
function traverseDom(
  node,
  isValidNode,
  processingInstructions,
  preprocessingInstructions,
  index
) {
  if (isValidNode(node)) {
    for (const instruction of preprocessingInstructions || []) {
      if (instruction.shouldPreprocessNode(node)) {
        instruction.preprocessNode(node, index);
      }
    }
    const processingInstruction = (processingInstructions || []).find(instruction =>
      instruction.shouldProcessNode(node)
    );
    if (processingInstruction != null) {
      const children = (node.children || [])
        .map((child, i) =>
          traverseDom(
            child,
            isValidNode,
            processingInstructions,
            preprocessingInstructions,
            i
          )
        )
        .filter(child => child != null && child !== false);
      return processingInstruction.replaceChildren
        ? createElement(node, index, node.data, [
            processingInstruction.processNode(node, children, index),
          ])
        : processingInstruction.processNode(node, children, index);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function Html2ReactParser(options) {
  function parseHtmlToTree(html) {
    options = options || {};
    options.decodeEntities = true;
    const handler = new DomHandler();
    const parser = new HtmlParser(handler, options);
    parser.parseComplete(html);
    return handler.dom.filter(element => element.type !== "directive");
  }
  function parseWithInstructions(
    html,
    isValidNode,
    processingInstructions,
    preprocessingInstructions
  ) {
    const domTree = parseHtmlToTree(html);
    const list = domTree.map((domTreeItem, index) =>
      traverseDom(
        domTreeItem,
        isValidNode,
        processingInstructions,
        preprocessingInstructions,
        index
      )
    );
    return list.length <= 1 ? list[0] : list;
  }
  function parse(html) {
    return parseWithInstructions(html, alwaysValid, defaultProcessingInstructions);
  }
  return {
    parse,
    parseWithInstructions,
  };
}
export {
  Html2ReactParser,
  alwaysValid,
  defaultProcessingInstructions,
  processDefaultNode,
};
