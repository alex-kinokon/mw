import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Suggest } from "@blueprintjs/select";
import { css } from "@emotion/css";
import { MenuItem } from "@blueprintjs/core";
import { Link as RouterLink } from "~/utils/router";
import { HTML } from "~/components/HTML";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";
import { useArticleContext } from "./view/Context";

interface SearchBoxProps {
  className?: string;
  active?: string;
}

export function SearchBox({ active, className }: SearchBoxProps) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 500);
  const { wiki } = useArticleContext();

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
              href={`./${encodeURIComponent(item.title.replaceAll(" ", "_"))}`}
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
      inputProps={{
        placeholder: active,
      }}
      noResults={
        <MenuItem disabled={true} text="No results." roleStructure="listoption" />
      }
    />
  );
}
