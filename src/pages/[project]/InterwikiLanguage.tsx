import { Classes, Menu } from "@blueprintjs/core";
import { css, cx } from "@emotion/css";
import { Link as RouterLink } from "~/utils/router";
import type { ParsePageResponse } from "~/wiki/action";

export function InterwikiLanguage({ links }: { links: ParsePageResponse["langlinks"] }) {
  return (
    <Menu
      className={css`
        max-height: 50vh;
        overflow-y: auto;
      `}
    >
      {links.map(({ lang, url, autonym }) => (
        <RouterLink
          className={cx(
            Classes.MENU_ITEM,
            css`
              color: var(--color-fg-default) !important;
            `
          )}
          key={lang}
          href={getLanguageLink(url)}
          lang={lang}
        >
          <span>{autonym}</span>
          <span
            className={css`
              opacity: 0.8;
              margin-left: 0px;
            `}
          >
            ({lang})
          </span>
        </RouterLink>
      ))}
    </Menu>
  );
}

function getLanguageLink(link: string) {
  const url = new URL(link);
  const { hostname, pathname } = url;
  if (hostname.endsWith("wikipedia.org") || hostname.endsWith("wiktionary.org")) {
    const [lang, host] = hostname.split(".");
    return `/${host}/${lang}/${pathname.replace(/^\/wiki\//, "")}`;
  }

  return link;
}
