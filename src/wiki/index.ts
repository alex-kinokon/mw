import { ActionAPI } from "./action";
import { RestAPI } from "./rest";

export type * as Action from "./action";
export type * as REST from "./rest";

export class MediaWiki {
  readonly action: ActionAPI;
  readonly rest: RestAPI;

  constructor(readonly host: string) {
    this.action = new ActionAPI(host);
    this.rest = new RestAPI(host);
  }
}
