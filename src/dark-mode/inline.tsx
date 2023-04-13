import { getStyleRule } from "./nodes";
import { Color, literals } from "./color";
import {
  forEachSafe,
  handleBackground,
  handleBorder,
  handleText,
  kebabCase,
  strongMemoize,
} from "./util";
import type { DarkModeConfig } from "./index";
import { ATTR } from "./index";

let temp: HTMLSpanElement;
let removeTimeout = 0;

function createSpan() {
  const span = document.createElement("span");
  span.style.display = "none";
  return span;
}

const withSpan =
  <P extends any[], T>(fn: (span: HTMLSpanElement, ...params: P) => T) =>
  (...args: P) => {
    temp ??= createSpan();
    document.body.appendChild(temp);
    const result = fn(temp, ...args);
    clearTimeout(removeTimeout);
    removeTimeout = window.setTimeout(() => temp.remove(), 3000);
    return result;
  };

const getRealColor = strongMemoize(
  withSpan((span, text: string): Color | undefined => {
    if (text.startsWith("rgb(") || text[0] === "#" || text in literals) {
      return Color.parse(text);
    }
    span.style.color = text;
    return Color.parse(getComputedStyle(span).color);
  })
);

export const applyInline = withSpan((span, config: DarkModeConfig) => {
  const { hooks = {}, root } = config;

  // #region styles
  let styles = [...root.querySelectorAll(`[style]:not([${ATTR}])`)] as HTMLElement[];

  if (hooks.shouldApply) {
    styles = styles.filter(hooks.shouldApply);
  }

  const match = (text: string) =>
    styles.filter(node => node.getAttribute("style")!.includes(text));

  const matchStrict = (prop: string) =>
    styles.filter(node => node.attributeStyleMap.has(prop));

  matchStrict("color").forEach(node => {
    if (!node.style.color || hooks?.shouldApplyTextColor?.(node) === false) {
      return;
    }

    const next = handleText(getRealColor(node.style.color));
    getStyleRule(node).style.setProperty("color", next, "important");
  });

  const borderKeys: (keyof CSSStyleDeclaration)[] = [
    "borderTopColor",
    "borderLeftColor",
    "borderRightColor",
    "borderBottomColor",
  ];

  match("border").forEach(node => {
    for (const key of borderKeys as any) {
      if (node.style[key]) {
        const next = getRealColor(node.style[key])!
          .map(c => handleBorder(config, c))
          .toStringAsRgb();
        getStyleRule(node).style.setProperty(kebabCase(key), next, "important");
      }
    }
  });

  match("background").forEach(node => {
    if (hooks.shouldApplyBackground?.(node) === false) return;

    const key = "backgroundColor";
    const original = node.style[key];
    if (original === "transparent") return;

    const color = getRealColor(original)!;
    let next: Color | undefined;

    if (node.textContent?.trim().length || ["TH", "TD"].includes(node.tagName)) {
      next = handleBackground(config, color);
    }

    if (next) {
      getStyleRule(node).style.setProperty(
        kebabCase(key),
        next.toStringAsRgb(),
        "important"
      );
    }
  });

  span.remove();

  // #endregion

  // #region legacy styles
  for (const attr of ["bgcolor"] as const) {
    forEachSafe(root.querySelectorAll(`[${attr}]`), el => {
      const color = getRealColor(el.getAttribute(attr)!);
      const dark = handleBackground(config, color);
      getStyleRule(el).style.setProperty(
        { bgcolor: "background-color" }[attr],
        dark.toStringAsRgb(),
        "important"
      );
    });
  }
});
