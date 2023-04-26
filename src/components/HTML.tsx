import { css } from "@emotion/css";
import { useLayoutEffect, useRef, useState } from "react";
import { render } from "react-dom";
import type { IconType } from "react-icons";
import { VscChevronDown, VscChevronRight } from "react-icons/vsc";

export function HTML({
  children,
  tag: Tag = "span",
  refCallback,
}: {
  children: string;
  tag?: "div" | "span";
  refCallback?: (ref: HTMLElement) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    ref.current!.setHTML(children);
    postprocess(ref.current!);
    refCallback?.(ref.current!);
  }, [children]);

  useLayoutEffect(() => {
    if (ref.current) {
      refCallback?.(ref.current);
    }
  }, [refCallback]);

  return <Tag ref={ref as any} />;
}

function postprocess(element: HTMLElement) {
  for (const name of ["ambox", "ombox", "tmbox", "cmbox"]) {
    const selector = `table.${name}:not(.mbox-small)`;
    for (const node of element.querySelectorAll(selector)) {
      if (node.parentElement?.matches(`.${name}`)) {
        return;
      }
      const hasPrev = node.previousElementSibling?.matches(selector);
      const hasNext = node.nextElementSibling?.matches(selector);
      node.classList.add(
        hasPrev && hasNext
          ? "sandwich-middle"
          : hasPrev
          ? "sandwich-bottom"
          : hasNext
          ? "sandwich-top"
          : "sandwich-orphan"
      );
    }
  }

  const selector = "div.NavFrame";
  for (const $it of element.querySelectorAll(selector)) {
    const hasPrev = $it.previousElementSibling?.matches(selector);
    const hasNext = $it.nextElementSibling?.matches(selector);
    $it.classList.add(
      hasPrev && hasNext
        ? "sandwich-middle"
        : hasPrev
        ? "sandwich-bottom"
        : hasNext
        ? "sandwich-top"
        : "sandwich-orphan"
    );
  }

  for (const h2 of element.querySelectorAll(".mw-parser-output h2" as "h2")) {
    h2.style.display = "flex";
    h2.style.alignItems = "center";
    const span = document.createElement("span");
    span.style.marginRight = "5px";
    h2.prepend(span);

    const parent = h2.parentElement;
    const inParent = parent?.matches(".mw-heading2");

    render(
      <Collapse
        onToggle={hidden => {
          for (const sibling of inParent
            ? nextUntil(parent as HTMLElement, ".mw-heading")
            : nextUntil(h2 as HTMLElement, "h2")) {
            sibling.style.display = hidden ? "none" : "";
          }
        }}
      />,
      span
    );
  }
}

function Collapse({ onToggle }: { onToggle?: (hidden: boolean) => void }) {
  const [hidden, setHidden] = useState(false);
  const Element: IconType = hidden ? VscChevronRight : VscChevronDown;

  return (
    <Element
      role="button"
      className={css`
        border: none;
        background: none;
      `}
      onClick={e => {
        e.stopPropagation();
        setHidden(!hidden);
        onToggle?.(!hidden);
      }}
    />
  );
}

function nextUntil(element: HTMLElement, selector: string): HTMLElement[] {
  const siblings: HTMLElement[] = [];

  while ((element = element.nextElementSibling as HTMLElement)) {
    if (element.matches(selector)) {
      break;
    }

    siblings.push(element);
  }

  return siblings;
}

if (typeof Sanitizer === "undefined") {
  await import("./polyfill");
}

declare global {
  interface Element {
    /**
     * The `setHTML()` method of the Element interface is used to parse and
     * sanitize a string of HTML and then insert it into the DOM as a subtree
     * of the element. It should be used instead of `Element.innerHTML` for
     * inserting untrusted strings of HTML into an element.
     * @param html A string defining HTML to be sanitized.
     * @param options An options object
     */
    setHTML(
      html: string,
      options?: {
        /**
         * A `Sanitizer` object which defines what elements of the input will be
         * sanitized. If not specified, the default Sanitizer object is used.
         */
        sanitizer?: Sanitizer;
      }
    ): void;
  }

  /**
   * @description `allowElements` creates a sanitizer that will drop any
   * elements that are not in `allowElements`, while `blockElements` and
   * `dropElements` create a sanitizer that will allow all elements except
   * those in these properties.
   *
   * `blockElements` and `dropElements` are processed before `allowElements`.
   * If you specify both properties, the elements in `blockElements` or
   * `dropElements` will be discarded first, followed by any elements not in
   * `allowElements`. So while it is possible to specify both types of
   * properties at the same time, the intent can always be more clearly
   * captured using just one type.
   *
   * The same applies to `allowAttributes` and `dropAttributes`.
   */
  interface SanitizerConfig {
    /**
     * An Array of strings indicating elements that the sanitizer should not
     * remove. All elements not in the array will be dropped.
     */
    allowElements?: string[];

    /**
     * An Array of strings indicating elements that the sanitizer should remove,
     * but keeping their child elements.
     */
    blockElements?: string[];

    /**
     * An Array of strings indicating elements (including nested elements) that
     * the sanitizer should remove.
     */
    dropElements?: string[];

    /**
     * An Object where each key is the attribute name and the value is an Array
     * of allowed tag names. Matching attributes will not be removed. All
     * attributes that are not in the array will be dropped.
     */
    allowAttributes?: Record<string, string[]>;

    /**
     * An Object where each key is the attribute name and the value is an Array
     * of dropped tag names. Matching attributes will be removed.
     */
    dropAttributes?: Record<string, string[]>;

    /**
     * A Boolean value set to false (default) to remove custom elements and
     * their children. If set to true, custom elements will be subject to
     * built-in and custom configuration checks (and will be retained or
     * dropped based on those checks).
     */
    allowCustomElements?: boolean;

    /**
     * A Boolean value set to false (default) to remove HTML comments. Set to
     * true in order to keep comments.
     */
    allowComments?: boolean;
  }

  /**
   * The `Sanitizer` interface of the HTML Sanitizer API provides methods to
   * sanitize untrusted strings of HTML, `Document` and `DocumentFragment` objects.
   * After sanitization, unwanted elements or attributes are removed, and the
   * returned objects can safely be inserted into a document’s DOM.
   */
  class Sanitizer {
    /**
     * Creates and returns a `Sanitizer` object, optionally with custom sanitization behavior.
     */
    constructor(config: SanitizerConfig);

    /**
     * Returns a sanitized `DocumentFragment` from an input `Document` or `DocumentFragment`
     * @param input A `DocumentFragment` or `Document` to be sanitized.
     * @returns A sanitized `DocumentFragment`.
     */
    sanitize(input: DocumentFragment | Document): DocumentFragment;

    /**
     * Parses a string of HTML in the context a particular element, and returns
     * an HTML element of that type containing the sanitized subtree.
     * @param element A string indicating the HTML tag of the element into
     *   which the input is to be inserted. For example "div", "table", "p", and so on.
     * @param input A string of HTML to be sanitized.
     * @returns An HTML element corresponding to the tag specified in the
     *   element parameter, containing the parsed and sanitized input string
     *   as a DOM subtree.
     */
    sanitizeFor(element: string, input: string): Element;
  }
}
