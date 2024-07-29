/// <reference types="vite/client" />

declare namespace React {
  interface Attributes {
    css?: string;
  }
  interface CSSProperties {
    [variableName: `--${string}`]: any;
  }
}

interface Array<T> {
  filter(predicate: BooleanConstructor): Exclude<T, null | undefined | false | "" | 0>[];
}
