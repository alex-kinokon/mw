import { ActionAPI } from "./action";
import { RestAPI } from "./rest";

export type * as Action from "./action";
export type * as REST from "./rest";

export type MediaWiki = ReturnType<typeof MediaWiki>;

export function MediaWiki(host: string) {
  return {
    host,
    action: ActionAPI(host),
    rest: new RestAPI(host),
  };
}
