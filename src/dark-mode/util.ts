export const darkModeMedia = "(prefers-color-scheme:dark)";
export const darkMode = matchMedia(darkModeMedia);
export const isDarkMode = () => darkMode.matches;

import type { DarkModeConfig } from ".";
import { Color } from "./color";

const lightness = "lightness";

export function forEachSafe<T>(list: Iterable<T>, fn: (value: T) => void) {
  for (const value of list) {
    fn(value);
  }
}

export function kebabCase(camelCase: string) {
  return camelCase.replace(/[A-Z]/g, match => "-" + match.toLowerCase());
}

export const strongMemoize = <T, R>(ifAbsent: (value: T) => R) => {
  const cache = new Map<T, R>();
  return (value: T) => {
    if (!cache.has(value)) {
      cache.set(value, ifAbsent(value));
    }
    return cache.get(value)!;
  };
};

export const weakMemoize = <T extends object, R>(ifAbsent: (value: T) => R) => {
  const cache = new WeakMap<T, R>();
  return (value: T) => {
    if (!cache.has(value)) {
      cache.set(value, ifAbsent(value));
    }
    return cache.get(value)!;
  };
};

export const handleText = strongMemoize((color: Color) => {
  const l = color.lab.lightness;
  const next =
    l < 0.1
      ? "#ebebeb"
      : l > 60
      ? color.toStringAsHex()
      : color.changeLAB(lightness, () => 100 - 0.6 * l).toStringAsHex();
  return next;
});

export const handleBorder = (config: DarkModeConfig, color: Color) =>
  invertColor(config, color) ?? color.changeLAB(lightness, l => 100 - 0.8 * l);

export const handleBackground = (config: DarkModeConfig, color: Color) =>
  invertColor(config, color) ??
  (color.lab.lightness > 60 ? color.changeLAB(lightness, l => 80 - 0.6 * l) : color);

let backgroundInversionMap: Map<string, Color> | undefined;

function invertColor(config: DarkModeConfig, color: Color) {
  const hex = color.toStringAsHex().slice(1);
  if (!backgroundInversionMap) {
    backgroundInversionMap = new Map(
      Object.entries(config.replaceMap).map(
        ([left, right]) => [left, Color.parseHex("#" + right)!] as const
      )
    );
  }

  return backgroundInversionMap.get(hex);
}
