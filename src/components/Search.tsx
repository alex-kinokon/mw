// https://github.com/GastonKhouri/chakra-ui-search/commit/5a38066a7d216bf699b3731849b94073f1da2fcb
import React, { useCallback, useState } from "react";
import type { BoxProps } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { css } from "@emotion/css";
import { primer } from "~/styles/primer";

interface Props<T extends { key: string }> extends BoxProps {
  /** Input value */
  value: string;
  /** If the search is loading */
  isLoading: boolean;
  /** Action to execute when changing the input value */
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Element that will be rendered to display the result */
  resultRenderer: (result: T) => JSX.Element;
  /** Action to execute when selecting a result */
  onResultSelect: (result: T) => void;
  /** Max Height of the results list */
  resultListMaxHeight?: string;
  /** Array of search results, Each item needs to have at least one id, _id or key property */
  searchResults?: T[];
  /** Input placeholder	 */
  placeholder?: string;
  /** Input configuration, for now you can only change its position */
  input?: { iconPosition: "left" | "right" };
  /** Text displayed when there are no results */
  noResultFoundText?: string;
}

export const Search = <T extends { key: string }>(props: Props<T>) => {
  const {
    value,
    isLoading,
    input,
    onSearchChange,
    resultRenderer,
    onResultSelect,
    resultListMaxHeight = "60vh",
    placeholder = "",
    searchResults = [],
    noResultFoundText = "No results found.",
    ...rest
  } = props;

  const { iconPosition = "left" } = input || {};

  const [showResults, setShowResults] = useState(false);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      setShowResults(false);
    }, 170);
  }, []);

  return (
    <Box position="relative" padding="2px" {...rest}>
      <InputGroup>
        {iconPosition === "left" && (
          <InputLeftElement
            pointerEvents="none"
            children={isLoading ? <Spinner size="sm" /> : <Icon as={FaSearch} />}
          />
        )}

        <Input
          borderColor="rgba(34,36,38,.15)"
          borderRadius="full"
          placeholder={placeholder}
          value={value}
          onChange={onSearchChange}
          onFocus={() => setShowResults(true)}
          onBlur={onBlur}
        />

        {iconPosition === "right" && (
          <InputRightElement
            pointerEvents="none"
            children={isLoading ? <Spinner size="sm" /> : <Icon as={FaSearch} />}
          />
        )}
      </InputGroup>
      {showResults && (
        <Box
          color="chakra-body-text"
          className={css`
            background-color: ${primer.canvas.overlay};
            border: 1px solid ${primer.header.search.border};
            box-shadow: 0 2px 4px 0 rgb(34 36 38 / 12%), 0 2px 10px 0 rgb(34 36 38 / 15%);
            border-radius: 0.3em;
            max-height: ${resultListMaxHeight};
            overflow-y: auto;
            position: absolute;
            z-index: 1;
            width: 100%;
          `}
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {searchResults.length > 0
            ? searchResults.map(result => (
                <Box
                  key={result.key}
                  borderBottom="1px solid rgba(34,36,38,.1)"
                  cursor="pointer"
                  _hover={{
                    bgColor: primer.accent.emphasis,
                  }}
                  onClick={() => onResultSelect(result)}
                >
                  <Flex alignItems="center">
                    <Box p="0.8em" margin="0">
                      {resultRenderer(result)}
                    </Box>
                  </Flex>
                </Box>
              ))
            : value.length > 0 &&
              !isLoading && (
                <Box borderBottom="1px solid rgba(34,36,38,.1)">
                  <Flex alignItems="center">
                    <Box p="0.8em" margin="0">
                      <Text>{noResultFoundText}</Text>
                    </Box>
                  </Flex>
                </Box>
              )}
        </Box>
      )}
    </Box>
  );
};
