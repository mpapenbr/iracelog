import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";
import {
  IBrushInterval,
  IDriverLapsSettings,
  IDriverStintSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionSettings,
  IRaceStintSharedSettings,
  UiComponent,
} from "./types";

export enum UiActionTypes {
  RESET = "@@ui/RESET",
  SET_STINT_NO = "@@ui/SET_STINT_NO",
  SHOW_ENTRY_DETAILS = "@@ui/SHOW_ENTRY_DETAILS",
  DRIVER_LAPS_SETTINGS = "@@ui/DRIVER_LAPS_SETTINGS",
  DRIVER_STINT_SETTINGS = "@@ui/DRIVER_STINT_SETTINGS",
  RACE_GRAPH_SETTINGS = "@@ui/RACE_GRAPH_SETTINGS",
  RACE_GRAPH_RELATIVE_SETTINGS = "@@ui/RACE_GRAPH_RELATIVE_SETTINGS",
  RACE_POSITION_SETTINGS = "@@ui/RACE_POSITION_SETTINGS",
  RACE_STINT_SHARED_SETTINGS = "@@ui/RACE_STINT_SHARED_SETTINGS",
  UPDATE_BRUSH_SETTINGS = "@@ui/UPDATE_BRUSH_SETTINGS",
}

export const uiReset = (): IBaseAction => action(UiActionTypes.RESET, {});

export const uiUpdateBrushSettings = (uiComp: UiComponent, data: IBrushInterval): IBaseAction =>
  action(UiActionTypes.UPDATE_BRUSH_SETTINGS, { component: uiComp, data: data });
export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
export const uiShowEntryDetails = (carIdx: number): IBaseAction => action(UiActionTypes.SHOW_ENTRY_DETAILS, carIdx);
export const uiDriverLapsSettings = (settings: IDriverLapsSettings): IBaseAction =>
  action(UiActionTypes.DRIVER_LAPS_SETTINGS, settings);
export const uiDriverStintSettings = (settings: IDriverStintSettings): IBaseAction =>
  action(UiActionTypes.DRIVER_STINT_SETTINGS, settings);
export const uiRaceGraphSettings = (settings: IRaceGraphSettings): IBaseAction =>
  action(UiActionTypes.RACE_GRAPH_SETTINGS, settings);
export const uiRaceGraphRelativeSettings = (settings: IRaceGraphRelativeSettings): IBaseAction =>
  action(UiActionTypes.RACE_GRAPH_RELATIVE_SETTINGS, settings);
export const uiRacePositionSettings = (settings: IRacePositionSettings): IBaseAction =>
  action(UiActionTypes.RACE_POSITION_SETTINGS, settings);
export const uiRaceStintSharedSettings = (settings: IRaceStintSharedSettings): IBaseAction =>
  action(UiActionTypes.RACE_STINT_SHARED_SETTINGS, settings);
