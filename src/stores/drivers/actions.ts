import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IDriverMeta } from "./types";

export enum EventDriverActionTypes {
  SAGA_LOAD_EVENT_DRIVERS = "@@eventDriver/SAGA_LOAD_EVENT_DRIVERS",

  SET_EVENT_DRIVERS = "@@eventDriver/SET_EVENT_DRIVERS",
}

export const loadEventDrivers = (raceEventId: string): IBaseAction =>
  action(EventDriverActionTypes.SAGA_LOAD_EVENT_DRIVERS, { token: "TBD_LOAD_EVENT_DRIVERS_TOKEN", id: raceEventId });

export const setEventDrivers = (data: IDriverMeta[]): IBaseAction =>
  action(EventDriverActionTypes.SET_EVENT_DRIVERS, data);
