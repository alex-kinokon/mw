import { createContext, useContextSelector } from "use-context-selector";
import type { Action, MediaWiki } from "~/wiki";

interface ArticleContext {
  wiki: MediaWiki;
  page: string;
  article?: Action.ParsePageResponse;
}
export const ArticleContext = createContext<ArticleContext>(null!);

function useContext1<T>(selector: (context: ArticleContext) => T) {
  return useContextSelector(ArticleContext, selector);
}
function useContext2(): ArticleContext {
  return new Proxy({} as ArticleContext, {
    get(_, prop) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useContext1(context => context[prop as keyof ArticleContext]);
    },
  });
}
export function useArticleContext(): ArticleContext;
export function useArticleContext<T>(selector: (context: ArticleContext) => T): T;

export function useArticleContext<T>(selector?: (context: ArticleContext) => T) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return selector ? useContextSelector(ArticleContext, selector) : useContext2();
}
