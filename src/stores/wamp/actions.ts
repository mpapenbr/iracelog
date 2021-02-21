import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";

export enum WampActionTypes {
  CONNECT = "@@wamp/CONNECT",
  CONNECTED = "@@wamp/CONNECTED",

  UPDATE_SESSION = "@@wamp/UPDATE_SESSION",
  UPDATE_MESSAGES = "@@wamp/UPDATE_MESSAGES",
  UPDATE_CARS = "@@wamp/UPDATE_CARS",
  UPDATE_PITSTOPS = "@@wamp/UPDATE_PITSTOPS",

  UPDATE_DUMMY = "@@wamp/UPDATE_DUMMY", // just for testing!
}

export const connectToServer = (): IBaseAction => action(WampActionTypes.CONNECT);
export const connectedToServer = (): IBaseAction => action(WampActionTypes.CONNECTED);
export const updateSession = (data: any): IBaseAction => action(WampActionTypes.UPDATE_SESSION, data);
export const updateMessages = (data: any): IBaseAction => action(WampActionTypes.UPDATE_MESSAGES, data);
export const updateCars = (data: any): IBaseAction => action(WampActionTypes.UPDATE_CARS, data);
export const updatePitstops = (data: any): IBaseAction => action(WampActionTypes.UPDATE_PITSTOPS, data);

export const updateDummy = (data: any): IBaseAction => action(WampActionTypes.UPDATE_DUMMY, data);
