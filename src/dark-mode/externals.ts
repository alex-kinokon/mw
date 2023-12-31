import { Color } from "./color";
import type { CSSRuleChild } from "./nodes";
import { processedRules } from "./nodes";
import { handleBackground, handleBorder, handleText } from "./util";
import { DefaultMap } from "./map";
import type { DarkModeConfig } from "./index";

interface Instruction {
  rule: CSSStyleRule;
  property: string;
  light: string;
  dark: string;
}

const arr: <T>(value: ArrayLike<T>) => T[] = Array.from;
const instructions: Instruction[] = [];

function replace<T>(
  key: string | string[],
  map: (value: string) => T | undefined,
  fn: (value: T) => Color | string | undefined
) {
  const cache = new DefaultMap<string, string | undefined>(current => {
    const mapped = map(current);
    let edited = mapped && fn(mapped);
    if (edited instanceof Color) {
      edited = edited.toStringAsHex();
    }
    return edited;
  });

  if (Array.isArray(key)) {
    const fns = key.map(key => replace(key, map, fn));
    return (rule: CSSStyleRule, applyNow: boolean): boolean =>
      fns.some(fn => fn(rule, applyNow));
  }

  return (rule: CSSStyleRule, applyNow: boolean) => {
    if (!rule.styleMap.has(key)) return false;

    const current = rule.styleMap.get(key)!.toString();
    const next = cache.get(current);
    if (next != null) {
      if (applyNow) {
        // Doesn’t work currently due to CSS node precedence issue
        // This will override anything before it, including user styles
        // because it has `media`.
        // getExternalStyleRule(rule.selectorText).styleMap.set(key, next)
        rule.styleMap.set(key, next);
      }
      instructions.push({ rule, property: key, light: current, dark: next });
    }
    return true;
  };
}

function extractNewRules(): CSSRuleChild[] {
  const rules = arr(document.styleSheets)
    .flatMap(sheet => {
      try {
        return arr(sheet.cssRules);
      } catch {
        return [];
      }
    })
    .filter(rule => !processedRules.has(rule));
  rules.forEach(rule => processedRules.add(rule));
  return rules;
}

export function recordExternalColors(config: DarkModeConfig, applyNow: boolean) {
  const editBackground = replace(["background-color"], Color.parseSafe, c =>
    handleBackground(config, c)
  );
  const editTextColor = replace(["color"], Color.parseSafe, handleText);
  const editBorderColor = replace(["border-color"], Color.parseSafe, c =>
    handleBorder(config, c)
  );
  const editSpecificBorderColor = replace(
    [
      "border-top-color",
      "border-left-color",
      "border-right-color",
      "border-bottom-color",
    ],
    Color.parseSafe,
    c => handleBorder(config, c)
  );

  const rules = extractNewRules();

  function recordRule(rule: CSSRuleChild) {
    if (rule instanceof CSSMediaRule) {
      return (
        rule.conditionText?.includes("prefers-color") ||
        [...(rule as any).cssRules].forEach(recordRule)
      );
    }

    if (rule instanceof CSSStyleRule) {
      if (config.hooks?.onCSSStyleRule?.(rule) === false) return;

      editBackground(rule, applyNow);
      editTextColor(rule, applyNow);
      editBorderColor(rule, applyNow);
      if (!rule.styleMap.has("border-color")) {
        editSpecificBorderColor(rule, applyNow);
      }
    }
  }

  rules.forEach(recordRule);
}

export function applyExternals(isDarkMode: boolean) {
  for (const { rule, property, light, dark } of instructions) {
    rule.styleMap.set(property, isDarkMode ? dark : light);
  }
}
