import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import { IColumnInfo } from "../ui/types";
import * as UiBaseActions from "./actions";

const AvailableStandingColumnsReducer = reducerWithInitialState([] as IColumnInfo[]).case(
  UiBaseActions.updateAvailableStandingsColumns,
  (state, data) => data
);
export interface IBaseData {
  availableStandingsColumns: IColumnInfo[];
}

const combinedReducers = combineReducers<IBaseData>({
  availableStandingsColumns: AvailableStandingColumnsReducer,
});

export { combinedReducers as baseDataReducers };
