import {
  ICarInfo,
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import actionCreatorFactory from "typescript-fsa";
import { ICarBaseData, ICarClass, IEventInfo, InboundManifests, ITrackInfo } from "./types";

const actionCreator = actionCreatorFactory("RACE_DATA");

// available manifests
export const processInboundManifests = actionCreator<InboundManifests>("PROCESS_INBOUND_MANIFESTS");

// available cars
export const updateAvailableCars = actionCreator<ICarBaseData[]>("UPDATE_AVAILABLE_CARS");

// available car classes
export const updateAvailableCarClasses = actionCreator<ICarClass[]>("UPDATE_AVAILABLE_CAR_CLASSES");

// car info
export const updateCarInfo = actionCreator<ICarInfo[]>("UPDATE_CAR_INFO");

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
// info messages
export const updateInfoMessages = actionCreator<IMessage[]>("UPDATE_INFO_MESSAGES");
// info messages
export const updateEventInfo = actionCreator<IEventInfo>("UPDATE_EVENT_INFO");
// info messages
export const updateTrackInfo = actionCreator<ITrackInfo>("UPDATE_TRACK_INFO");
