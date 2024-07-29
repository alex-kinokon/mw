import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { Search } from "lucide-react";
import { tw } from "@aet/tailwind/macro";
import { useRoute } from "~/utils/router";
import { useMediaWiki } from "~/hooks/useMediaWiki";
import { useSiteInfo } from "~/wiki/hooks";

function useActiveProject() {
  return useRoute("/:project/:a*")!.project;
}

interface Site {
  name: string;
  icon: string;
}

const sites: Site[] = [
  {
    name: "Wikipedia",
    icon: "https://en.wikipedia.org/static/images/icons/wikipedia.png",
  },
  {
    name: "Wiktionary",
    icon: "https://en.wiktionary.org/static/images/project-logos/enwiktionary.png",
  },
];

// <RouterLink className={Classes.MENU_ITEM} href="/org.wikipedia.en">
// Wikipedia
// </RouterLink>
// <RouterLink className={Classes.MENU_ITEM} href="/org.wiktionary.en">
// Wiktionary
// </RouterLink>

export function ProjectPicker() {
  const project = useActiveProject();
  const { data: siteInfo } = useSiteInfo(useMediaWiki(project));
  const general = siteInfo?.general;
  const icon = general?.logo;

  return (
    <div css="flex items-center gap-1">
      <img src={icon} height={20} alt={general?.sitename} />
      <span css="font-serif">{general?.sitename}</span>

      <Select<Site>
        items={sites}
        popoverProps={{
          placement: "bottom-end",
          popoverClassName: tw`![transform:scale(1)_translate(-6.4rem)] [&>.bp5-popover-arrow]:ml-[5.75rem]`,
        }}
        itemPredicate={(name, item) =>
          item.name.toLowerCase().includes(name.toLowerCase())
        }
        itemRenderer={(film, { handleClick, handleFocus, modifiers }) =>
          modifiers.matchesPredicate ? (
            <MenuItem
              active={modifiers.active}
              disabled={modifiers.disabled}
              key={film.name}
              onClick={handleClick}
              onFocus={handleFocus}
              roleStructure="listoption"
              text={film.name}
            />
          ) : null
        }
        noResults={
          <MenuItem disabled={true} text="No results." roleStructure="listoption" />
        }
        inputProps={{
          inputClassName: tw`-mr-8 ml-2 !w-[calc(100%-0.5rem)]`,
          leftElement: <Search css="ml-2 mt-[6px] block size-4" />,
        }}
        onItemSelect={() => {}}
      >
        <Button
          minimal
          rightIcon="caret-down"
          css="-ml-2 -mr-2 !outline-none hover:!bg-transparent"
        />
      </Select>
    </div>
  );
}
