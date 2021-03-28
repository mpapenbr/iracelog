import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import { IDriverLapsSettings, IRaceGraphRelativeSettings, IRaceGraphSettings, IRacePositionSettings } from "./types";

export enum UiActionTypes {
  RESET = "@@ui/RESET",
  SET_STINT_NO = "@@ui/SET_STINT_NO",
  SHOW_ENTRY_DETAILS = "@@ui/SHOW_ENTRY_DETAILS",
  DRIVER_LAPS_SETTINGS = "@@ui/DRIVER_LAPS_SETTINGS",
  RACE_GRAPH_SETTINGS = "@@ui/RACE_GRAPH_SETTINGS",
  RACE_GRAPH_RELATIVE_SETTINGS = "@@ui/RACE_GRAPH_RELATIVE_SETTINGS",
  RACE_POSITION_SETTINGS = "@@ui/RACE_POSITION_SETTINGS",
}

export const uiReset = (): IBaseAction => action(UiActionTypes.RESET, {});

export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
export const uiShowEntryDetails = (carIdx: number): IBaseAction => action(UiActionTypes.SHOW_ENTRY_DETAILS, carIdx);
export const uiDriverLapsSettings = (settings: IDriverLapsSettings): IBaseAction =>
  action(UiActionTypes.DRIVER_LAPS_SETTINGS, settings);
export const uiRaceGraphSettings = (settings: IRaceGraphSettings): IBaseAction =>
  action(UiActionTypes.RACE_GRAPH_SETTINGS, settings);
export const uiRaceGraphRelativeSettings = (settings: IRaceGraphRelativeSettings): IBaseAction =>
  action(UiActionTypes.RACE_GRAPH_RELATIVE_SETTINGS, settings);
export const uiRacePositionSettings = (settings: IRacePositionSettings): IBaseAction =>
  action(UiActionTypes.RACE_POSITION_SETTINGS, settings);
