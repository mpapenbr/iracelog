import { action } from "typesafe-actions";
import { IBaseAction } from "../../commons";

export enum UiActionTypes {
  SET_STINT_NO = "@@ui/SET_STINT_NO",
}

export const uiSetStintNo = (no: number): IBaseAction => action(UiActionTypes.SET_STINT_NO, no);
