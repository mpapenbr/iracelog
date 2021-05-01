import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import { IAvailableCarsPayload } from "../basedata/actions";
import * as RaceActions from "./actions";

/**
 * this interface describes the attributes concerning the race data which are stored in the state
 */
export interface IRaceData {
  availableCars: IAvailableCarsPayload[];
}

const AvailableCarsReducer = reducerWithInitialState([] as IAvailableCarsPayload[]).case(
  RaceActions.updateAvailableCars,
  (state, cars) => ({
    ...state,
    cars,
  })
);

const combinedReducers = combineReducers<IRaceData>({
  availableCars: AvailableCarsReducer,
});

export { combinedReducers as raceDataReducers };
