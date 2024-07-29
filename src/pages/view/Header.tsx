import {
  Alignment,
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  Popover,
} from "@blueprintjs/core";
import { SearchBox } from "../SearchBox";
import { PageTabs } from "./Tabs";
import { ProjectPicker } from "~/components/ProjectPicker";
import { InterwikiLanguage } from "../InterwikiLanguage";

export function ArticleHeader() {
  return (
    <Navbar css="sticky top-0 z-1 grid-area-[header]">
      <NavbarGroup align={Alignment.LEFT} css="mr-12">
        <ProjectPicker />
        <NavbarDivider />
        <PageTabs />
      </NavbarGroup>

      <NavbarGroup>
        <SearchBox css="min-w-[50vw]" />
      </NavbarGroup>

      <NavbarGroup align={Alignment.RIGHT}>
        <Button
          minimal
          icon="moon"
          aria-label="Toggle dark mode"
          onClick={() => document.body.classList.toggle("bp5-dark")}
        />
        <Popover content={<InterwikiLanguage />}>
          <Button icon="globe" />
        </Popover>
      </NavbarGroup>
    </Navbar>
  );
}
