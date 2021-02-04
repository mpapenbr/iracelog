import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IDriverMeta } from "../drivers/types";
import { ICarStintData } from "../types/stints";
import { IEventSummary, IRaceEvent } from "./types";

export enum RaceEventActionTypes {
  SAGA_LOAD_EVENTS = "@@raceEvents/SAGA_LOAD_EVENTS",
  SAGA_DELETE_EVENT = "@@raceEvents/SAGA_DELETE_EVENTS",
  SAGA_LOAD_EVENT_DATA = "@@raceEvents/SAGA_LOAD_EVENT_DATA",
  SAGA_ENSURE_EVENT_DATA = "@@raceEvents/SAGA_ENSURE_EVENT_DATA",
  SAGA_LOAD_EVENT_STINT_DATA = "@@raceEvents/SAGA_LOAD_EVENT_STINT_DATA",
  SAGA_ENSURE_EVENT_STINT_DATA = "@@raceEvents/SAGA_ENSURE_EVENT_STINT_DATA",

  SET_EVENTS = "@@raceEvents/SET_EVENTS",
  SET_EVENT_MAIN_DATA = "@@raceEvents/SET_EVENT_MAIN_DATA",
  SET_EVENT_SUMMARY = "@@raceEvents/SET_EVENT_SUMMARY",
  SET_EVENT_DRIVERS = "@@raceEvents/SET_EVENT_DRIVERS",
  SET_EVENT_STINTS = "@@raceEvents/SET_EVENT_STINTS",
  SET_EVENT_LOADED = "@@raceEvents/SET_EVENT_LOADED",
  SET_EVENT_STINTS_LOADED = "@@raceEvents/SET_EVENT_STINTS_LOADED",
  RESET_EVENT_DATA = "@@raceEvents/RESET_EVENT_DATA",
}

export const loadRaceEvents = (): IBaseAction => action(RaceEventActionTypes.SAGA_LOAD_EVENTS, {});
export const deleteRaceEvent = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_DELETE_EVENT, { token: token, id: id });

export const loadEventData = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_LOAD_EVENT_DATA, { token: token, id: id });
export const ensureEventData = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_ENSURE_EVENT_DATA, { token: token, id: id });

export const loadEventStints = (token: string, id: string, sessionNum: number): IBaseAction =>
  action(RaceEventActionTypes.SAGA_LOAD_EVENT_STINT_DATA, { token: token, id: id, sessionNum: sessionNum });
export const ensureEventStints = (token: string, id: string, sessionNum: number): IBaseAction =>
  action(RaceEventActionTypes.SAGA_ENSURE_EVENT_STINT_DATA, { token: token, id: id, sessionNum: sessionNum });

export const setRaceEvents = (data: IRaceEvent[]): IBaseAction => action(RaceEventActionTypes.SET_EVENTS, data);
export const setEventLoaded = (id: string): IBaseAction => action(RaceEventActionTypes.SET_EVENT_LOADED, id);
export const setEventStintsLoaded = (id: string): IBaseAction =>
  action(RaceEventActionTypes.SET_EVENT_STINTS_LOADED, id);
export const resetEventData = (): IBaseAction => action(RaceEventActionTypes.RESET_EVENT_DATA, {});
export const setEventMain = (data: IRaceEvent): IBaseAction => action(RaceEventActionTypes.SET_EVENT_MAIN_DATA, data);
export const setEventSummary = (data: IEventSummary): IBaseAction =>
  action(RaceEventActionTypes.SET_EVENT_SUMMARY, data);
export const setEventDrivers = (data: IDriverMeta[]): IBaseAction =>
  action(RaceEventActionTypes.SET_EVENT_DRIVERS, data);
export const setEventStints = (data: ICarStintData[]): IBaseAction =>
  action(RaceEventActionTypes.SET_EVENT_STINTS, data);
