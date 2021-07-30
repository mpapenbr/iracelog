import { action } from "typesafe-actions";
import { actionCreatorFactory } from "typescript-fsa";
import { IBaseAction } from "../../commons";
import {
  IBrushInterval,
  ICircleOfDoomSettings,
  IClassificationSettings,
  IDriverLapsSettings,
  IDriverStintsSettings,
  IGlobalSettings,
  IMessagesSettings,
  IPitstopsSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionsSettings,
  IReplaySettings,
  IStintsSettings,
  UiComponent,
} from "./types";

export enum UiActionTypes {
  SET_STINT_NO = "@@ui/SET_STINT_NO",
  SHOW_ENTRY_DETAILS = "@@ui/SHOW_ENTRY_DETAILS",

  UPDATE_BRUSH_SETTINGS = "@@ui/UPDATE_BRUSH_SETTINGS",
}

export const uiUpdateBrushSettings = (uiComp: UiComponent, data: IBrushInterval): IBaseAction =>
  action(UiActionTypes.UPDATE_BRUSH_SETTINGS, { component: uiComp, data: data });
export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
export const uiShowEntryDetails = (carIdx: number): IBaseAction => action(UiActionTypes.SHOW_ENTRY_DETAILS, carIdx);

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
export const circleOfDoomSettings = actionCreator<ICircleOfDoomSettings>("CIRCLE_OF_DOOM_SETTINGS");

export const replaySettings = actionCreator<IReplaySettings>("REPLAY_SETTINGS");
export const globalSettings = actionCreator<IGlobalSettings>("GLOBAL_SETTINGS");
export const demoSettings = actionCreator<number>("DEMO_SETTINGS");

// TODO: rethink if saga would be better mechanism to distribute selections
export const sagaPitstopsSettings = actionCreator<IPitstopsSettings>("SAGA_PITSTOPS_SETTINGS");
export const sagaStintsSettings = actionCreator<IStintsSettings>("SAGA_STINTS_SETTINGS");
