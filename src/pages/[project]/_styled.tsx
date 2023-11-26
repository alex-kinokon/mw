import styled from "@emotion/styled";

export const Content = styled.div`
  overflow: scroll;
  position: relative;
  font-size: 16px;

  table {
    border-collapse: separate;
  }

  a {
    color: #0366d6;
    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }

  p {
    max-width: 800px;
    line-height: 1.6;
    margin-bottom: 7px;
  }

  li {
    margin-bottom: 0.4em;
  }

  ul,
  ol {
    margin-block-start: 0.3em;
    margin-inline-end: 0;
    margin-block-end: 0;
    margin-inline-start: 1.6em;
    padding: 0;
  }

  h2 {
    font-size: 1.25em;
    border-bottom: 1px solid var(--color-border-default);
    margin-bottom: 0.25em;
  }

  // https://en.wikipedia.org/w/load.php?lang=en&modules=skins.vector.styles&only=styles&skin=vector

  .mw-editsection {
    display: none;
  }

  div.tleft {
    margin: 0.5em 1.4em 1.3em 0;
  }
  div.tright {
    margin: 0.5em 0 1.3em 1.4em;
  }

  div.tleft,
  div.floatleft,
  table.floatleft {
    float: left;
    clear: left;
  }

  div.thumbinner {
    background-color: #fdfdfd;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 0 5px #c8c8c84d;
    padding: 3px 5px;
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
  b,
  strong,
  th {
    font-weight: 600;
  }

  h2 {
    font-size: 1.5rem;
    margin-top: 10px;
  }

  h3 {
    font-size: 1.25rem;
    margin-top: 10px;
  }

  h4 {
    font-size: 1.125rem;
    margin-top: 10px;
  }

  ol,
  ul {
    /* padding-inline-start: 2em; */
    margin-bottom: 0.5em;
  }
  table ol,
  table ul {
    padding-inline-start: 1em;
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

  #bandeau-portail,
  .bandeau,
  .catlinks,
  .content .infobox,
  .infobox,
  .infobox_v2,
  .infobox_v3 {
    --box-shadow-color: #c8c8c81a;
    background-color: #fdfdfd;
    border: 1px solid #ddd;
    border-radius: 4px;
    border-spacing: 0;
    box-shadow: 0 0 5px 2px #c8c8c81a;
    line-height: 1.4em;
    margin-bottom: 20px;
    overflow: hidden;
    padding: 0;
  }

  div.sister-wikipedia td:only-child,
  table.infobox td:only-child,
  table.infobox_v2 td:only-child {
    padding-left: 10px;
    padding-right: 10px;
  }

  html[data-theme="dark"] & {
    a {
      color: #6999fb;
    }
    img[src*="Loudspeaker.svg"] {
      filter: invert(1);
    }
  }

  // Adjust anchor position to account for fixed header
  .mw-headline::before {
    content: "";
    display: block;
    height: 60px;
    margin-top: -60px;
    visibility: hidden;
  }
`;
