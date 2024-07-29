import Icon from "@aet/icons/macro";
import { css, cx } from "@emotion/css";
import { useMemo, useState } from "react";
import { HTML } from "~/components/HTML";
import type * as wiki from "~/wiki";
import { useArticleContext } from "./Context";

function collapseTOCLevelIntoATree(sections: wiki.Action.ParseResponseSection[]) {
  const tree: wiki.Action.SectionTree[] = [];
  for (const section of sections) {
    const path = section.number.split(".").map(_ => parseInt(_) - 1);
    const index = path.pop()!;
    const parent = path.reduce((accum, index) => accum.children[index], {
      children: tree,
    });

    parent.children[index] = { ...section, children: [] };
  }
  return tree;
}

function TOCEntry({ item }: { item: wiki.Action.SectionTree }) {
  const [show, setShow] = useState(false);
  const hasChildren = item.children.length > 0;

  return (
    <li
      key={item.anchor}
      data-level={item.toclevel}
      className={css`
        padding: 0.3rem 0;
        padding-left: 10px;
        padding-right: 2rem;
      `}
    >
      <button
        className={css`
          background: transparent;
          border: none;
          display: grid;
          text-align: left;
          grid-template-columns: 1em 1fr;
          gap: 0.5em;
        `}
        onClick={() => setShow(!show)}
      >
        {hasChildren ? (
          <Icon
            icon={show ? "VscChevronDown" : "VscChevronRight"}
            className={css`
              cursor: pointer;
              font-size: 1.2em;
              width: 1.2em;
            `}
          />
        ) : (
          <svg height="1em" width="1em" />
        )}
        <a
          className={cx(
            "toc",
            css`
              &.active {
                font-weight: bold;
              }
            `
          )}
          href={`#${item.anchor}`}
        >
          <HTML>{item.line}</HTML>
        </a>
      </button>

      {hasChildren && show && (
        <ul
          className={css`
            list-style: none;
            padding: 0;
            margin: 0;
            margin-left: 5px;
          `}
        >
          {item.children.map(item => (
            <TOCEntry key={item.anchor} item={item} />
          ))}
        </ul>
      )}
    </li>
  );
}

function TOC({ value }: { value: wiki.Action.ParseResponseSection[] }) {
  const tree = useMemo(() => collapseTOCLevelIntoATree(value), [value]);

  return (
    <ul css="m-0 mt-4 list-none p-0">
      {tree.map(item => (
        <TOCEntry key={item.anchor} item={item} />
      ))}
    </ul>
  );
}

export function ArticleTableOfContent() {
  const { article } = useArticleContext();
  return (
    <div css="mt-[var(--header-height)] h-[calc(100vh-var(--header-height))] overflow-scroll px-2">
      {article != null && <TOC value={article.sections} />}
    </div>
  );
}
