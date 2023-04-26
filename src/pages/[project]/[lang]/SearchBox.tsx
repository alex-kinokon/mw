import { Box, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "wouter";
import { useState } from "react";
import { HTML } from "~/components/HTML";
import type { MediaWiki } from "~/wiki";
import { Search } from "~/components/Search";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";

interface SearchBoxProps {
  wiki: MediaWiki;
}

export function SearchBox({ wiki }: SearchBoxProps) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 500);

  const { data } = useQuery({
    enabled: debouncedValue.length > 0,
    queryKey: ["search", wiki.host, debouncedValue],
    queryFn: () => wiki.rest.autocompleteTitle(debouncedValue).then(_ => _.pages),
  });

  const searchItems = data?.map(item => ({ ...item, key: item.title })) ?? [];

  return (
    <Search
      width={600}
      mx="auto"
      placeholder="Search"
      value={value}
      isLoading={false}
      input={{ iconPosition: "left" }}
      onSearchChange={e => {
        setValue(e.target.value);
      }}
      onResultSelect={() => {}}
      resultRenderer={item => (
        <Box>
          <RouterLink to={`./${encodeURIComponent(item.title.replaceAll(" ", "_"))}`}>
            <Text fontWeight={500} color="chakra-body-text">
              {item.title}
            </Text>
            <Text fontSize="sm" color="chakra-body-text">
              <HTML>{item.description || ""}</HTML>
            </Text>
          </RouterLink>
        </Box>
      )}
      searchResults={searchItems}
    />
  );
}
