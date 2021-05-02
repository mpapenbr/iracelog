import { IMessage } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import { IAvailableCarsPayload } from "../basedata/actions";
import * as RaceActions from "./actions";

/**
 * this interface describes the attributes concerning the race data which are stored in the state
 */
export interface IRaceData {
  availableCars: IAvailableCarsPayload[];
  sessionInfo: IMessage;
  classification: IMessage;
}

const AvailableCarsReducer = reducerWithInitialState([] as IAvailableCarsPayload[]).case(
  RaceActions.updateAvailableCars,
  (state, cars) => ({
    ...state,
    cars,
  })
);

// session info
const initialSessionInfo: IMessage = { msgType: 1, timestamp: 0, data: [] };
const SessionInfoReducer = reducerWithInitialState(initialSessionInfo).case(
  RaceActions.updateSessionInfo,
  (state, info) => ({
    ...info,
  })
);

// classification
const initialClassification: IMessage = { msgType: 1, timestamp: 0, data: [] };
const ClassificationReducer = reducerWithInitialState(initialClassification).case(
  RaceActions.updateClassification,
  (state, arg) => ({
    ...arg,
  })
);

const combinedReducers = combineReducers<IRaceData>({
  availableCars: AvailableCarsReducer,
  sessionInfo: SessionInfoReducer,
  classification: ClassificationReducer,
});

export { combinedReducers as raceDataReducers };
