import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "wouter";
import { useState } from "react";
import { Suggest } from "@blueprintjs/select";
import { css } from "@emotion/css";
import { MenuItem } from "@blueprintjs/core";
import { HTML } from "~/components/HTML";
import type { MediaWiki } from "~/wiki";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";

interface SearchBoxProps {
  className?: string;
  wiki: MediaWiki;
}

export function SearchBox({ className, wiki }: SearchBoxProps) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 500);

  const { data } = useQuery({
    enabled: debouncedValue.length > 0,
    queryKey: ["autocompleteTitle", wiki.host, debouncedValue],
    queryFn: () => wiki.rest.autocompleteTitle(debouncedValue).then(_ => _.pages),
  });

  const searchItems = data?.map(item => ({ ...item, key: item.title })) ?? [];

  return (
    <Suggest
      className={className}
      items={searchItems}
      itemPredicate={(query, item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      }
      itemRenderer={(item, props) => (
        <MenuItem
          key={item.key}
          active={props.modifiers.active}
          text={
            <RouterLink
              to={`./${encodeURIComponent(item.title.replaceAll(" ", "_"))}`}
              className={css`
                display: block;
              `}
            >
              <div
                className={css`
                  font-weight: 500;
                `}
              >
                {item.title}
              </div>
              <div>
                <HTML>{item.description || ""}</HTML>
              </div>
            </RouterLink>
          }
        />
      )}
      query={value}
      onQueryChange={setValue}
      onItemSelect={() => {}}
      inputValueRenderer={item => item.title}
      noResults={
        <MenuItem disabled={true} text="No results." roleStructure="listoption" />
      }
    />
  );
}
