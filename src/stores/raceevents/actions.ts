import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IEventSummary, IRaceEvent } from "./types";

export enum RaceEventActionTypes {
  SAGA_LOAD_EVENTS = "@@raceEvents/SAGA_LOAD_EVENTS",
  SAGA_DELETE_EVENT = "@@raceEvents/SAGA_DELETE_EVENTS",
  SAGA_LOAD_EVENT_DATA = "@@raceEvents/SAGA_LOAD_EVENT_DATA",

  SET_EVENTS = "@@raceEvents/SET_EVENTS",
  SET_EVENT_SUMMARY = "@@raceEvents/SET_EVENT_SUMMARY",
}

export const loadRaceEvents = (): IBaseAction => action(RaceEventActionTypes.SAGA_LOAD_EVENTS, {});
export const deleteRaceEvent = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_DELETE_EVENT, { token: token, id: id });

export const loadEventData = (token: string, id: string): IBaseAction =>
  action(RaceEventActionTypes.SAGA_LOAD_EVENT_DATA, { token: token, id: id });

export const setRaceEvents = (data: IRaceEvent[]): IBaseAction => action(RaceEventActionTypes.SET_EVENTS, data);
export const setEventSummary = (data: IEventSummary): IBaseAction =>
  action(RaceEventActionTypes.SET_EVENT_SUMMARY, data);
