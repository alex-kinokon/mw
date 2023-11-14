// import { css } from "@emotion/css";
import { Button, Classes, Menu, Popover } from "@blueprintjs/core";
import { Link as RouterLink, useRoute } from "wouter";

function useActiveProject() {
  return useRoute("/:project/:a*")[1]?.project;
}

export function ProjectPicker() {
  const project = useActiveProject();

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
        icon="applications"
        text={project}
        className={Classes.NAVBAR_HEADING}
      />
    </Popover>
  );
}
