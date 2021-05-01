import { action } from "typesafe-actions";
import { actionCreatorFactory } from "typescript-fsa";
import { IBaseAction } from "../../commons";
import {
  IBrushInterval,
  IClassificationSettings,
  IDriverLapsSettings,
  IDriverStintsSettings,
  IMessagesSettings,
  IPitstopsSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionsSettings,
  IRaceStintSharedSettings,
  IStintsSettings,
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
  MESSAGES_SETTINGS = "@@ui/MESSAGES_SETTINGS",
  CLASSIFICATION_SETTINGS = "@@ui/CLASSIFICATION_SETTINGS",
}

export const uiReset = (): IBaseAction => action(UiActionTypes.RESET, {});

export const uiUpdateBrushSettings = (uiComp: UiComponent, data: IBrushInterval): IBaseAction =>
  action(UiActionTypes.UPDATE_BRUSH_SETTINGS, { component: uiComp, data: data });
export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
export const uiShowEntryDetails = (carIdx: number): IBaseAction => action(UiActionTypes.SHOW_ENTRY_DETAILS, carIdx);
export const uiDriverLapsSettings = (settings: IDriverLapsSettings): IBaseAction =>
  action(UiActionTypes.DRIVER_LAPS_SETTINGS, settings);
export const uiDriverStintSettings = (settings: IDriverStintsSettings): IBaseAction =>
  action(UiActionTypes.DRIVER_STINT_SETTINGS, settings);
export const uiRacePositionSettings = (settings: IRacePositionsSettings): IBaseAction =>
  action(UiActionTypes.RACE_POSITION_SETTINGS, settings);
export const uiRaceStintSharedSettings = (settings: IRaceStintSharedSettings): IBaseAction =>
  action(UiActionTypes.RACE_STINT_SHARED_SETTINGS, settings);

// new actions start here
const actionCreator = actionCreatorFactory("UI");

export const classificationSettings = actionCreator<IClassificationSettings>("CLASSIFICATION_SETTINGS");
export const messagesSettings = actionCreator<IMessagesSettings>("MESSAGES_SETTINGS");
export const raceGraphSettings = actionCreator<IRaceGraphSettings>("RACEGRAPH_SETTINGS");
export const raceGraphRelativeSettings = actionCreator<IRaceGraphRelativeSettings>("RACEGRAPH_RELATIVE_SETTINGS");
export const racePositionsSettings = actionCreator<IRacePositionsSettings>("RACEPOSITIONS_SETTINGS");
export const driverLapsSettings = actionCreator<IDriverLapsSettings>("DRIVERLAPS_SETTINGS");
export const pitstopsSettings = actionCreator<IPitstopsSettings>("PITSTOPS_SETTINGS");
export const stintsSettings = actionCreator<IStintsSettings>("STINTS_SETTINGS");
export const driverStintsSettings = actionCreator<IDriverStintsSettings>("DRIVER_STINTS_SETTINGS");
