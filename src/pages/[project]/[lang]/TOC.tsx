import { css } from "@emotion/css";
import { HTML } from "~/components/HTML";
import type * as wiki from "~/wiki";

export function TOC({ value }: { value: wiki.Action.ParseResponseSection[] }) {
  return (
    <div
      className={css`
        overflow: scroll;
        max-height: 100%;
        width: 300px;
        min-width: 300px;
      `}
    >
      <ul>
        {value.map(item => (
          <li
            key={item.anchor}
            className={css`
              // to css:
              padding: 0.3rem 0;
              padding-left: ${Math.max(item.toclevel * 20 - 10, 5)}px;
              padding-right: 2rem;
            `}
          >
            <a href={`#${item.anchor}`}>
              <HTML>{item.line}</HTML>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
