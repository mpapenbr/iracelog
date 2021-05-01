import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as UiBaseActions from "./actions";

const AvailableCarsReducer = reducerWithInitialState([]).case(UiBaseActions.updateAvailableCars, (state, cars) => ({
  ...state,
  cars,
}));

const combinedReducers = combineReducers<object>({
  availableCars: AvailableCarsReducer,
});

export { combinedReducers as baseDataReducers };
