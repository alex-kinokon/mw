import Icon from "@aet/icons/macro";
import { css } from "@emotion/css";
import { useMemo, useState } from "react";
import { HTML } from "~/components/HTML";
import type * as wiki from "~/wiki";

function collapseTOCLevelIntoATree(sections: wiki.Action.ParseResponseSection[]) {
  const tree: wiki.Action.SectionTree[] = [];
  const stack: wiki.Action.SectionTree[] = [];
  let lastLevel = 0;
  for (const section of sections) {
    const level = section.toclevel;
    const node = { ...section, children: [] };
    if (level > lastLevel) {
      stack.push(tree.at(-1)!);
    } else if (level < lastLevel) {
      for (let i = 0; i < lastLevel - level; i++) {
        stack.pop();
      }
    }
    stack.at(-1)?.children.push(node);
    tree.push(node);
    lastLevel = level;
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
      <div
        className={css`
          display: grid;
          grid-template-columns: 1em 1fr;
          gap: 0.3em;
        `}
      >
        {hasChildren ? (
          <Icon
            icon={show ? "VscChevronDown" : "VscChevronRight"}
            onClick={() => setShow(!show)}
            className={css`
              cursor: pointer;
              font-size: 1.2em;
              width: 1.2em;
            `}
          />
        ) : (
          <svg height="1em" width="1em" />
        )}
        <a href={`#${item.anchor}`}>
          <HTML>{item.line}</HTML>
        </a>
      </div>

      {hasChildren && show && (
        <ul
          className={css`
            list-style: none;
            padding: 0;
            margin: 0;
            margin-left: 10px;
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

export function TOC({ value }: { value: wiki.Action.ParseResponseSection[] }) {
  const tree = useMemo(() => collapseTOCLevelIntoATree(value), [value]);

  return (
    <div
      className={css`
        overflow: scroll;
        max-height: 100%;
        width: 300px;
        min-width: 300px;
      `}
    >
      <ul
        className={css`
          list-style: none;
          padding: 0;
          margin: 0;
        `}
      >
        {tree.map(item => (
          <TOCEntry key={item.anchor} item={item} />
        ))}
      </ul>
    </div>
  );
}
