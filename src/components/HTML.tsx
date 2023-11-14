import createDOMPurify from "dompurify";
import { useLayoutEffect, useRef } from "react";

const DOMPurify = createDOMPurify(window);

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
    ref.current!.innerHTML = DOMPurify.sanitize(children);
    refCallback?.(ref.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return <Tag ref={ref as any} />;
}
