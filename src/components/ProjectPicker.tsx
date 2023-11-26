import { css } from "@emotion/css";
import { Button, Classes, Menu, Popover } from "@blueprintjs/core";
import { Link as RouterLink, useRoute } from "wouter";
import { useMediaWiki } from "~/pages/_utils";
import { useSiteInfo } from "~/wiki/hooks";

function useActiveProject() {
  return useRoute("/:project/:a*")[1]!.project;
}

export function ProjectPicker() {
  const project = useActiveProject();
  const { data: siteInfo } = useSiteInfo(useMediaWiki(project));
  const icon = siteInfo?.general.logo;

  return (
    <Popover
      minimal
      content={
        <Menu>
          <RouterLink className={Classes.MENU_ITEM} to="/">
            Wikipedia
          </RouterLink>
          <RouterLink className={Classes.MENU_ITEM} to="/wiktionary/en">
            Wiktionary
          </RouterLink>
        </Menu>
      }
      placement="bottom"
    >
      <Button
        alignText="left"
        icon={
          icon ? (
            <img
              src={icon}
              alt={siteInfo?.general.sitename ?? project}
              className={css`
                object-fit: contain;
                width: 2em;
                height: 2em;
              `}
            />
          ) : (
            "applications"
          )
        }
        text={siteInfo?.general.sitename ?? project}
        className={Classes.NAVBAR_HEADING}
        minimal
      />
    </Popover>
  );
}
