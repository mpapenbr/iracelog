import {
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import actionCreatorFactory from "typescript-fsa";
import { ICarBaseData, ICarClass } from "./types";

const actionCreator = actionCreatorFactory("RACE_DATA");

// available cars
export const updateAvailableCars = actionCreator<ICarBaseData[]>("UPDATE_AVAILABLE_CARS");

// available car classes
export const updateAvailableCarClasses = actionCreator<ICarClass[]>("UPDATE_AVAILABLE_CAR_CLASSES");

// session info
export const updateSessionInfo = actionCreator<IMessage>("UPDATE_SESSION_INFO");
// classification
export const updateClassification = actionCreator<IMessage>("UPDATE_CLASSIFICATION");

// race graph
export const updateRaceGraph = actionCreator<IRaceGraph[]>("UPDATE_RACE_GRAPH");
// car laps
export const updateCarLaps = actionCreator<ICarLaps[]>("UPDATE_CAR_LAPS");
// car stints
export const updateCarStints = actionCreator<ICarStintInfo[]>("UPDATE_CAR_STINTS");
// car stints
export const updateCarPits = actionCreator<ICarPitInfo[]>("UPDATE_CAR_PITS");
