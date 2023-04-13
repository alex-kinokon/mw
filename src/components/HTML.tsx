import { useLayoutEffect, useRef } from "react";

export function HTML({
  children,
  tag: Tag = "span",
}: {
  children: string;
  tag?: "div" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    ref.current!.setHTML(children);
  }, [children]);

  return <Tag ref={ref as any} />;
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
