import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IRaceEvent } from "./types";

export enum RaceEventActionTypes {
  SAGA_LOAD_EVENTS = "@@raceEvents/SAGA_LOAD_EVENTS",
  SAGA_DELETE_EVENT = "@@raceEvents/SAGA_DELETE_EVENTS",

  SET_EVENTS = "@@raceEvents/SET_EVENTS",
}

export const loadRaceEvents = (): IBaseAction => action(RaceEventActionTypes.SAGA_LOAD_EVENTS, {});
export const deleteRaceEvent = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_DELETE_EVENT, { token: token, id: id });

export const setRaceEvents = (data: IRaceEvent[]): IBaseAction => action(RaceEventActionTypes.SET_EVENTS, data);
