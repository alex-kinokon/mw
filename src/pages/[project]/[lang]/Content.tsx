import styled from "@emotion/styled";

export const Content = styled.div`
  max-width: 100%;
  overflow: scroll;

  a {
    color: #0366d6;
  }

  p {
    max-width: 900px;
    line-height: 1.6;
    margin-bottom: 7px;
  }

  .mw-editsection {
    display: none;
  }

  div.tright,
  div.floatright,
  table.floatright {
    clear: right;
    float: right;
  }

  h2,
  h3,
  h4 {
    font-weight: 600;
    margin-bottom: 4px;
  }

  h2 {
    font-size: var(--chakra-fontSizes-2xl);
    margin-top: 10px;
  }

  h3 {
    font-size: var(--chakra-fontSizes-xl);
    margin-top: 10px;
  }

  h4 {
    font-size: var(--chakra-fontSizes-lg);
    margin-top: 10px;
  }

  ol,
  ul {
    padding-inline-start: 2em;
    margin-bottom: 0.5em;
  }

  dl {
    margin-top: 0.2em;
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin-left: 1.6em;
    margin-bottom: 0.6em;
  }
  img {
    display: inline-block;
  }

  html[data-theme="dark"] & {
    a {
      color: #6999fb;
    }
    img[src*="Loudspeaker.svg"] {
      filter: invert(1);
    }
  }
`;
