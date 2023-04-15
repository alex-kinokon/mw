import { Box, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { HTML } from "~/components/HTML";
import type { MediaWiki, SearchResponse } from "~/wiki";
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
    queryFn: () =>
      wiki.query<SearchResponse>({
        list: "search",
        srsearch: debouncedValue,
        utf8: true,
        format: "json",
        origin: "*",
      }),
  });

  const searchItems =
    data?.query.search.map(item => ({ ...item, key: item.title })) ?? [];

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
          <RouterLink
            to={`../${encodeURIComponent(item.title.replaceAll(" ", "_"))}`}
            relative="path"
          >
            <Text fontWeight={500}>{item.title}</Text>
            <Text fontSize="sm">
              <HTML>{item.snippet}</HTML>
            </Text>
          </RouterLink>
        </Box>
      )}
      searchResults={searchItems}
    />
  );
}
