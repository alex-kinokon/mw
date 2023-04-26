import { css } from "@emotion/css";
import { Box, Link, Text } from "@chakra-ui/react";
import { HTML } from "~/components/HTML";
import type * as wiki from "~/wiki";
import { primer } from "~/styles/primer";

export function TOC({ value }: { value: wiki.Action.ParseResponseSection[] }) {
  return (
    <Box
      className={css`
        border-top: 1px solid var(--color-border-muted);
        overflow: scroll;
        max-height: 100%;
      `}
    >
      {value.map(item => (
        <Box
          key={item.anchor}
          py="1"
          paddingLeft={item.toclevel * 4 + 2}
          paddingRight={2}
          _hover={{
            bg: primer.canvas.overlay,
            color: "white",
          }}
        >
          <Link href={`#${item.anchor}`}>
            <Text>
              <HTML>{item.line}</HTML>
            </Text>
          </Link>
        </Box>
      ))}
    </Box>
  );
}
