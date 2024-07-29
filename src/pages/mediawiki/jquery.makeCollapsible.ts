// https://github.com/wikimedia/mediawiki/commit/66257898dafd71843d7a8995c7c751fbbdc56fb6
// Modified based on MediaWiki’s jquery.makeCollapsible.js
// License: CC BY 3.0 DEED https://creativecommons.org/licenses/by/3.0

/**
 * jQuery makeCollapsible
 * Dual licensed:
 * - CC BY 3.0 <https://creativecommons.org/licenses/by/3.0>
 * - GPL2 <http://www.gnu.org/licenses/old-licenses/gpl-2.0.html>
 */
import $ from "jquery";
import { css } from "@emotion/css";

const i18n = {
  "collapsible-collapse": "masquer",
  "collapsible-expand": "afficher",
};

const t = <K extends keyof typeof i18n>(key: K) => i18n[key];

const mw_collapsible_toggle = css`
  float: right;
  user-select: none;
  cursor: pointer;

  /* Collapse links in captions should be inline */
  caption &,
  .mw-content-ltr caption &,
  .mw-content-rtl caption &,
  .mw-content-rtl .mw-content-ltr caption &,
  .mw-content-ltr .mw-content-rtl caption & {
    float: none;
  }
`;

const mw_collapsible_toggle_default = css`
  appearance: none;
  background: none;
  margin: 0;
  padding: 0;
  border: 0;
  font: inherit;
`;

const mw_collapsible_text = css`
  color: #0645ad;
  .${mw_collapsible_toggle_default}:hover & {
    text-decoration: underline;
  }
  .${mw_collapsible_toggle_default}:active & {
    color: #faa700;
  }
`;

const customToggle = css`
  key: mw-customtoggle;
  cursor: pointer;
`;

/**
 * Handler for a click on a collapsible toggler.
 * @param expand Expand the element, otherwise collapse
 */
function toggleElement(
  $collapsible: JQuery,
  expand: boolean,
  $defaultToggle: JQuery<HTMLElement>
) {
  // Validate parameters

  // $collapsible must be an instance of jQuery
  if (!$collapsible.jquery) {
    return;
  }

  // Trigger a custom event to allow callers to hook to the collapsing/expanding,
  // allowing the module to be testable, and making it possible to
  // e.g. implement persistence via cookies

  // Handle different kinds of elements
  let $containers;
  if ($collapsible.is("table")) {
    // Tables
    // If there is a caption, hide all rows; otherwise, only hide body rows
    $containers = $collapsible.find("> caption").length
      ? $collapsible.find("> * > tr")
      : $collapsible.find("> tbody > tr");
    if ($defaultToggle) {
      // Exclude table row containing toggle link
      $containers = $containers.not($defaultToggle.closest("tr"));
    }
  } else if ($collapsible.is("ul") || $collapsible.is("ol")) {
    // Lists
    $containers = $collapsible.find("> li");
    if ($defaultToggle) {
      // Exclude list-item containing toggle link
      $containers = $containers.not($defaultToggle.parent());
    }
  } else {
    // Everything else: <div>, <p> etc.
    const $collapsibleContent = $collapsible.find("> .mw-collapsible-content");

    // If a collapsible-content is defined, act on it
    $containers = $collapsibleContent.length
      ? $collapsibleContent
      : // Otherwise assume this is a customcollapse with a remote toggle
        // .. and there is no collapsible-content because the entire element should be toggled
        $collapsible;
  }

  $containers.toggle(expand);
}

interface HandlerOptions {
  wasCollapsed?: boolean;
  toggleText?: {
    collapseText: string;
    expandText: string;
  };
}

/**
 * Handle click/keypress on the collapsible element toggle and other
 * situations where a collapsible element is toggled (e.g. the initial
 * toggle for collapsed ones).
 * @param $toggle the clickable toggle itself
 * @param $collapsible the collapsible element
 * @param e either the event or null if unavailable
 */
function togglingHandler(
  $toggle: JQuery,
  $collapsible: JQuery,
  e: JQuery.TriggeredEvent | null,
  options: HandlerOptions = {}
) {
  if (e) {
    if (
      e.type === "click" &&
      e.target.nodeName.toLowerCase() === "a" &&
      $(e.target).attr("href")
    ) {
      // Don't fire if a link was clicked (for pre-made togglers)
      return;
    } else if (e.type === "keydown" && e.which !== 13 && e.which !== 32) {
      // Only handle the "Enter" or "Space" keys
      return;
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // This allows the element to be hidden on initial toggle without fiddling with the class
  const wasCollapsed =
    options.wasCollapsed !== undefined
      ? options.wasCollapsed
      : $collapsible.hasClass("mw-collapsed");

  // Toggle the state of the collapsible element (that is, expand or collapse)
  $collapsible.toggleClass("mw-collapsed", !wasCollapsed);

  // Toggle the mw_collapsible_toggle classes, if requested (for default and pre-made togglers by default)
  $toggle
    .toggleClass("mw-collapsible-toggle-collapsed", !wasCollapsed)
    .toggleClass("mw-collapsible-toggle-expanded", wasCollapsed);

  // Toggle `aria-expanded` attribute, if requested (for default and pre-made togglers by default).
  $toggle.attr("aria-expanded", wasCollapsed ? "true" : "false");

  // Toggle the text ("Show"/"Hide") within elements tagged with mw_collapsible_text
  if (options.toggleText) {
    const { collapseText, expandText } = options.toggleText;

    const $textContainer = $toggle.find(`.${mw_collapsible_text}`);
    if ($textContainer.length) {
      $textContainer.text(wasCollapsed ? collapseText : expandText);
    }
  }

  // And finally toggle the element state itself
  toggleElement($collapsible, !!wasCollapsed, $toggle);
}

/**
 * Enable collapsible-functionality on all elements in the collection.
 *
 * - Will prevent binding twice to the same element.
 * - Initial state is expanded by default, this can be overridden by adding class
 *   "mw-collapsed" to the "mw-collapsible" element.
 * - Elements made collapsible have jQuery data "mw-made-collapsible" set to true.
 * - The inner content is wrapped in a "div.mw-collapsible-content" (except for tables and lists).
 */
export function makeCollapsible(this: HTMLElement) {
  // Ensure class "mw-collapsible" is present in case .makeCollapsible()
  // is called on element(s) that don't have it yet.
  const $collapsible = $(this).addClass("mw-collapsible");

  // Return if it has been enabled already.
  if ($collapsible.data("mw-made-collapsible")) {
    return;
  } else {
    // Let CSS know that it no longer needs to worry about flash of unstyled content.
    // This will allow mediawiki.makeCollapsible.styles to disable temporary pseudo elements, that
    // are needed to avoid a flash of unstyled content.
    $collapsible.addClass("mw-made-collapsible").data("mw-made-collapsible", true);
  }

  // Use custom text or default?
  const collapseText =
    $collapsible.attr("data-collapsetext") || t("collapsible-collapse");
  const expandText = $collapsible.attr("data-expandtext") || t("collapsible-expand");

  // Default click/keydown handler and toggle link to use when none is present
  let actionHandler = function (
    this: HTMLElement,
    e: JQuery.TriggeredEvent | null,
    opts: HandlerOptions
  ) {
    togglingHandler($(this), $collapsible, e, {
      toggleText: { collapseText, expandText },
      ...opts,
    });
  };

  // Default toggle link. Only build it when needed to avoid jQuery memory leaks (event data).
  const buildDefaultToggleLink = () =>
    $(/* html */ `
      <button type="button" class="${mw_collapsible_toggle} ${mw_collapsible_toggle_default}">
        [<span class="${mw_collapsible_text}">${collapseText}</span>]
      </button>
    `);

  // Check if this element has a custom position for the toggle link
  // (ie. outside the container or deeper inside the tree)
  let $customTogglers: JQuery | undefined;
  let collapsibleId = $collapsible.attr("id") || "";
  if (collapsibleId.startsWith("mw-customcollapsible-")) {
    collapsibleId = $.escapeSelector(collapsibleId);
    $customTogglers = $(
      "." + collapsibleId.replace("mw-customcollapsible", customToggle)
    ).addClass(customToggle);
  }

  // Add event handlers to custom togglers or create our own ones
  let $toggle: JQuery;
  if ($customTogglers?.length) {
    actionHandler = function (e, opts) {
      togglingHandler($(this), $collapsible, e, { ...opts });
    };

    $toggle = $customTogglers;
  } else {
    // If this is not a custom case, do the default: wrap the
    // contents and add the toggle link. Different elements are
    // treated differently.

    let $firstItem;
    if ($collapsible.is("table")) {
      // If the table has a caption, collapse to the caption
      // as opposed to the first row
      const $caption = $collapsible.find("> caption");
      if ($caption.length) {
        $toggle = $caption
          .find(`> .${mw_collapsible_toggle}, .mw-collapsible-toggle-placeholder`)
          .first();

        // If there is no toggle link, add it to the end of the caption
        if (!$toggle.length) {
          $toggle = buildDefaultToggleLink().appendTo($caption);
        }
      } else {
        // The toggle-link will be in one of the cells (td or th) of the first row
        $firstItem = $collapsible.find("tr").first().find("th, td");
        $toggle = $firstItem
          .find(`> .${mw_collapsible_toggle}, .mw-collapsible-toggle-placeholder`)
          .first();

        // If theres no toggle link, add it to the last cell
        if (!$toggle.length) {
          $toggle = buildDefaultToggleLink().prependTo($firstItem.eq(-1));
        }
      }
    } else if (
      $collapsible.parent().is("li") &&
      $collapsible.parent().children(".mw-collapsible").length === 1 &&
      $collapsible.find(`> .${mw_collapsible_toggle}, .mw-collapsible-toggle-placeholder`)
        .length === 0
    ) {
      // special case of one collapsible in <li> tag
      $toggle = buildDefaultToggleLink();
      $collapsible.before($toggle);
    } else if ($collapsible.is("ul") || $collapsible.is("ol")) {
      // The toggle-link will be in the first list-item
      $firstItem = $collapsible.find("li").first();
      $toggle = $firstItem
        .find(`> .${mw_collapsible_toggle}, .mw-collapsible-toggle-placeholder`)
        .first();

      // If theres no toggle link, add it
      if (!$toggle.length) {
        // Make sure the numeral order doesn't get messed up, force the first (soon to be second) item
        // to be "1". Except if the value-attribute is already used.
        // If no value was set WebKit returns "", Mozilla returns '-1', others return 0, null or undefined.
        const firstVal = $firstItem.prop("value");
        if (firstVal === undefined || !firstVal || firstVal === "-1" || firstVal === -1) {
          $firstItem.prop("value", "1");
        }
        $toggle = buildDefaultToggleLink();
        $toggle
          .wrap(/* html */ `<li class="mw-collapsible-toggle-li"></li>`)
          .parent()
          .prependTo($collapsible);
      }
    } else {
      // <div>, <p> etc.

      // The toggle-link will be the first child of the element
      $toggle = $collapsible
        .find(`> .${mw_collapsible_toggle}, .mw-collapsible-toggle-placeholder`)
        .first();

      // If a direct child .content-wrapper does not exists, create it
      if (!$collapsible.find("> .mw-collapsible-content").length) {
        $collapsible.wrapInner(/* html */ `<div class="mw-collapsible-content"></div>`);
      }

      // If theres no toggle link, add it
      if (!$toggle.length) {
        $toggle = buildDefaultToggleLink().prependTo($collapsible);
      }
    }
  }

  // If the toggle is just a placeholder, replace it with a real one
  if ($toggle.hasClass("mw-collapsible-toggle-placeholder")) {
    const $realToggle = buildDefaultToggleLink();
    $toggle.replaceWith($realToggle);
    $toggle = $realToggle;
  }

  // Attach event handlers to toggle link
  $toggle
    .on("click.mw-collapsible keydown.mw-collapsible", actionHandler)
    .attr("aria-expanded", "true")
    .prop("tabIndex", 0);

  // $(jq).data("mw-collapsible", {
  //   collapse() {
  //     actionHandler.call($toggle.get(0)!, null, { wasCollapsed: false });
  //   },
  //   expand() {
  //     actionHandler.call($toggle.get(0)!, null, { wasCollapsed: true });
  //   },
  //   toggle() {
  //     actionHandler.call($toggle.get(0)!, null, {});
  //   },
  // });

  // Initial state
  if ($collapsible.hasClass("mw-collapsed")) {
    // One toggler can hook to multiple elements, and one element can have
    // multiple togglers. This is the best way to handle that.
    actionHandler.call($toggle.get(0)!, null, { wasCollapsed: false });
  }
}
