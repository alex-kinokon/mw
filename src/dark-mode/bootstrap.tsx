import * as darkMode from "./index";

const colorPalette = {
  "#000000": "#121212",
  "#2a4b8d": "#2a4b8d",
  "#3366cc": "#36c",
  "#54595d": "#54595d",
  "#8080ff": "#2c2c59",
  "#a2a9b1": "#2c2d30",
  "#aaaaaa": "#444",
  "#c8ccd1": "#222",
  "#ccccff": "#333346",
  "#ccffcc": "#002c04",
  "#cddeff": "#253750",
  "#cef2e0": "#133024",
  "#d3d3d3": "#000",
  "#dcffc9": "#143701",
  "#ddddff": "#212229",
  "#e0ffff": "#2e4747",
  "#e3f9df": "#111910",
  "#e6e6fa": "#2B2C3B",
  "#e6f2ff": "#1d2731",
  "#eaecf0": "#18191c",
  "#ecfcf4": "#15201a",
  "#f3f3fe": "#252558",
  "#f3f9ff": "#1c2125",
  "#f4ffff": "#181f1f",
  "#f5f3ef": "#232221",
  "#f5f5ff": "#212229",
  "#f5fffa": "#1f1f1b",
  "#f7f8ff": "#131a4f",
  "#f7fbff": "#1f2021",
  "#f8f9fa": "#1f2021",
  "#f9f9f9": "#1f1f1f",
  "#f9f9ff": "#1f1f23",
  "#f2f2f2": "#252525",
  "#f9ffbc": "#1e2300",
  "#fa8072": "#570e05",
  "#fdfdfd": "#121212",
  "#ff0000": "#b50707",
  "#ffd700": "#978007",
  "#ffdbdb": "#321717",
  "#fffaef": "#493d1d",
  "#fffff0": "#1c1d12",
  "#fffff3": "#373701",
  "#ffffff": "#0a0a0a",
};

if (!("styleMap" in CSSStyleRule.prototype)) {
  const { polyfill } = await import("./polyfill/houdini");
  polyfill(window);
}

let cssResetHandled = false;

export function applyDarkMode(target: HTMLElement) {
  darkMode.start({
    root: target,
    replaceMap: Object.fromEntries(
      Object.entries(colorPalette).map(([k, v]) => [k.slice(1), v.slice(1)])
    ),
    hooks: {
      shouldApply(node) {
        return !node.classList.contains("mw-no-invert");
      },
      shouldApplyBackground(node) {
        return /^(th|td|tr|div|span|p|table|caption|kbd|code|blockquote)$/i.test(
          node.tagName
        );
      },
      onCSSStyleRule(rule) {
        // Wikisource has a crazy CSS reset
        if (
          !cssResetHandled &&
          rule.parentStyleSheet?.ownerNode instanceof HTMLLinkElement &&
          rule.selectorText?.startsWith("div, ")
        ) {
          rule.styleMap.delete("background");
          rule.styleMap.delete("font");
          cssResetHandled = true;
          return false;
        }
      },
    },
  });
}
