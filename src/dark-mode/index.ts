import { darkMode, isDarkMode } from "./util";
import { applyExternals, recordExternalColors } from "./externals";
import { applyInline } from "./inline";
import { appendNodes } from "./nodes";

export const ATTR = "data-css";

export interface DarkModeConfig {
  readonly root: ParentNode;
  readonly hooks?: {
    /** Returns false to stop processing this rule */
    onCSSStyleRule?(style: CSSStyleRule): void | false;
    /** Return false to skip the node. */
    shouldApply?(node: HTMLElement): boolean;
    /** Color filter. Return false to skip the node */
    shouldApplyTextColor?(node: HTMLElement): boolean;
    /** Background filter. Return false to skip the node */
    shouldApplyBackground?(node: HTMLElement): boolean;
  };
  /** Special cases for these colors. */
  readonly replaceMap: Record<string, string>;
}

export async function start(configs: Partial<DarkModeConfig>) {
  const config: DarkModeConfig = {
    root: document,
    hooks: {},
    replaceMap: {
      ffffff: "121212",
    },
  };

  Object.assign(config, configs);
  appendNodes();
  applyInline(config);

  if (isDarkMode()) {
    recordExternalColors(config, true);

    darkMode.addEventListener("change", e => {
      applyExternals(e.matches);
    });

    new MutationObserver(() => {
      applyInline(config);
      recordExternalColors(config, isDarkMode());
    }).observe(document.head, {
      childList: true,
      subtree: false,
    });
  }
}
