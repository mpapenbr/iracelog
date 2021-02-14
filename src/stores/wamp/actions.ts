import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";

export enum WampActionTypes {
  CONNECT = "@@wamp/CONNECT",
  CONNECTED = "@@wamp/CONNECTED",

  UPDATE_DUMMY = "@@wamp/UPDATE_DUMMY", // just for testing!
}

export const connectToServer = (): IBaseAction => action(WampActionTypes.CONNECT);
export const connectedToServer = (): IBaseAction => action(WampActionTypes.CONNECTED);
export const updateDummy = (data: any): IBaseAction => action(WampActionTypes.UPDATE_DUMMY, data);
