import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IRaceEvent } from "./types";

export enum RaceEventActionTypes {
  SAGA_LOAD_EVENTS = "@@raceEvents/SAGA_LOAD_EVENTS",

  SET_EVENTS = "@@raceEvents/SET_EVENTS",
}

export const loadRaceEvents = (): IBaseAction => action(RaceEventActionTypes.SAGA_LOAD_EVENTS, {});

export const setRaceEvents = (data: IRaceEvent[]): IBaseAction => action(RaceEventActionTypes.SET_EVENTS, data);
