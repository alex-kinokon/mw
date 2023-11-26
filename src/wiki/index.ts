import { type APIRequester, ActionAPI } from "./action";
import { RestAPI } from "./rest";

export type * as Action from "./action";
export type * as REST from "./rest";

export class MediaWiki {
  readonly action: APIRequester;
  readonly rest: RestAPI;

  constructor(readonly host: string) {
    this.action = ActionAPI(host);
    this.rest = new RestAPI(host);
  }
}
