import $ from "jquery";
import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Icon from "@aet/icons/macro";
import { makeCollapsible } from "./mediawiki/jquery.makeCollapsible";

function combineMBoxes(element: HTMLElement) {
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
}

export function processWikiHTML(element: HTMLElement): (() => void) | undefined {
  combineMBoxes(element);
  const tocItems = document.getElementsByClassName("toc");

  const obs = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const { id } = entry.target;
          if (!id) return;
          for (const a of tocItems) {
            (a as HTMLElement).classList.toggle(
              "active",
              a.getAttribute("href") === `#${id}`
            );
          }
        }
      }
    },
    {
      root: null,
      rootMargin: "-10px",
      threshold: 0,
    }
  );

  const selector = "div.NavFrame";
  for (const frame of element.querySelectorAll(selector)) {
    const hasPrev = frame.previousElementSibling?.matches(selector);
    const hasNext = frame.nextElementSibling?.matches(selector);
    frame.classList.add(
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
    h2.classList.add(css`
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    `);
    const span = document.createElement("span");
    span.className = css`
      margin-right: 5px;
    `;

    const parent = h2.parentElement;
    const section = document.createElement("section");
    section.append(
      ...(parent?.matches(".mw-heading2")
        ? nextUntil(parent, ".mw-heading")
        : nextUntil(h2 as HTMLElement, "h2"))
    );
    h2.after(section);

    const onClickRef: OnClickRef = { current: null };
    h2.addEventListener("click", e => {
      const hidden = onClickRef.current?.(e);
      section.style.display = hidden ? "none" : "";
    });

    createRoot(span).render(<Collapse onClickRef={onClickRef} />);
  }

  for (const anchors of element.querySelectorAll(".mw-parser-output .mw-headline")) {
    obs.observe(anchors);
  }

  $(element).find(".mw-collapsible").each(makeCollapsible);

  return () => obs.disconnect();
}

type OnClickRef = React.MutableRefObject<((e: MouseEvent) => boolean) | null>;

function Collapse({ onClickRef }: { onClickRef: OnClickRef }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    onClickRef.current = e => {
      e.stopPropagation();
      setHidden(!hidden);
      return !hidden;
    };
  }, [hidden, onClickRef]);

  return (
    <Icon
      icon={hidden ? "VscChevronRight" : "VscChevronDown"}
      role="button"
      className={css`
        border: none;
        background: none;
      `}
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
