import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";

export enum UiActionTypes {
  SET_STINT_NO = "@@ui/SET_STINT_NO",
  SHOW_ENTRY_DETAILS = "@@ui/SHOW_ENTRY_DETAILS",
}

export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
export const uiShowEntryDetails = (carIdx: number): IBaseAction => action(UiActionTypes.SHOW_ENTRY_DETAILS, carIdx);
