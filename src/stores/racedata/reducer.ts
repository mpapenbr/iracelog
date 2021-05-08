import {
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as RaceActions from "./actions";
import { ICarBaseData, ICarClass } from "./types";

/**
 * this interface describes the attributes concerning the race data which are stored in the state
 */
export interface IRaceData {
  availableCars: ICarBaseData[];
  availableCarClasses: ICarClass[];
  sessionInfo: IMessage;
  classification: IMessage;
  raceGraph: IRaceGraph[];
  carLaps: ICarLaps[];
  carStints: ICarStintInfo[];
  carPits: ICarPitInfo[];
}

// available cars
export const AvailableCarsReducer = reducerWithInitialState([] as ICarBaseData[]).case(
  RaceActions.updateAvailableCars,
  (state, cars) => {
    return [...cars];
  }
);

// available car classes
export const AvailableCarClassesReducer = reducerWithInitialState(
  [] as ICarClass[]
).case(RaceActions.updateAvailableCarClasses, (state, classes) => [...classes]);

// race graph
export const RaceGraphReducer = reducerWithInitialState([] as IRaceGraph[]).case(
  RaceActions.updateRaceGraph,
  (state, data) => [...data]
);

// car laps
export const CarLapsReducer = reducerWithInitialState([] as ICarLaps[]).case(
  RaceActions.updateCarLaps,
  (state, data) => [...data]
);

// car pits
export const CarStintsReducer = reducerWithInitialState([] as ICarStintInfo[]).case(
  RaceActions.updateCarStints,
  (state, data) => [...data]
);

// car pits
export const CarPitsReducer = reducerWithInitialState([] as ICarPitInfo[]).case(
  RaceActions.updateCarPits,
  (state, data) => [...data]
);

// session info
export const initialSessionInfo: IMessage = { msgType: 1, timestamp: 0, data: [] };
export const SessionInfoReducer = reducerWithInitialState(initialSessionInfo).case(
  RaceActions.updateSessionInfo,
  (state, info) => ({
    ...info,
  })
);

// classification
export const initialClassification: IMessage = { msgType: 1, timestamp: 0, data: [] };
export const ClassificationReducer = reducerWithInitialState(initialClassification).case(
  RaceActions.updateClassification,
  (state, arg) => ({
    ...arg,
  })
);

const combinedReducers = combineReducers<IRaceData>({
  availableCars: AvailableCarsReducer,
  availableCarClasses: AvailableCarClassesReducer,
  sessionInfo: SessionInfoReducer,
  classification: ClassificationReducer,
  raceGraph: RaceGraphReducer,
  carLaps: CarLapsReducer,
  carStints: CarStintsReducer,
  carPits: CarPitsReducer,
});

export { combinedReducers as raceDataReducers };
