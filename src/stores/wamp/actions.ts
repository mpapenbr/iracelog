import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";

export enum WampActionTypes {
  CONNECT = "@@wamp/CONNECT",
  CONNECTED = "@@wamp/CONNECTED",

  UPDATE_MANIFESTS = "@@wamp/UPDATE_MANIFESTS",

  UPDATE_SESSION = "@@wamp/UPDATE_SESSION",
  UPDATE_MESSAGES = "@@wamp/UPDATE_MESSAGES",
  UPDATE_CARS = "@@wamp/UPDATE_CARS",
  UPDATE_PITSTOPS = "@@wamp/UPDATE_PITSTOPS",

  UPDATE_FROM_STATE = "@@wamp/UPDATE_FROM_STATE", // contains data for session,messages,cars,pitstops (the big one)

  SET = "@@wamp/SET",
  RESET = "@@wamp/RESET",

  UPDATE_DUMMY = "@@wamp/UPDATE_DUMMY", // just for testing!
}

export const connectToServer = (): IBaseAction => action(WampActionTypes.CONNECT);
export const connectedToServer = (): IBaseAction => action(WampActionTypes.CONNECTED);

export const updateManifests = (data: any): IBaseAction => action(WampActionTypes.UPDATE_MANIFESTS, data);

export const updateSession = (data: any): IBaseAction => action(WampActionTypes.UPDATE_SESSION, data);
export const updateMessages = (data: any): IBaseAction => action(WampActionTypes.UPDATE_MESSAGES, data);
export const updateCars = (data: any): IBaseAction => action(WampActionTypes.UPDATE_CARS, data);
export const updatePitstops = (data: any): IBaseAction => action(WampActionTypes.UPDATE_PITSTOPS, data);

export const updateFromStateMessage = (data: any): IBaseAction => action(WampActionTypes.UPDATE_FROM_STATE, data);

export const setData = (data: any): IBaseAction => action(WampActionTypes.SET, data);
export const reset = (): IBaseAction => action(WampActionTypes.RESET);

export const updateDummy = (data: any): IBaseAction => action(WampActionTypes.UPDATE_DUMMY, data);
