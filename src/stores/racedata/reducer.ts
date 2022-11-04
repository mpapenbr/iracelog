import {
  defaultManifests,
  ICarInfo,
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IManifests,
  IMessage,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as RaceActions from "./actions";
import { ICarBaseData, ICarClass, IEventInfo, ITrackInfo } from "./types";
import { postProcessManifest } from "./util";

/**
 * this interface describes the attributes concerning the race data which are stored in the state
 */
export interface IRaceData {
  manifests: IManifests;
  availableCars: ICarBaseData[];
  availableCarClasses: ICarClass[];
  sessionInfo: IMessage;
  classification: IMessage;
  raceGraph: IRaceGraph[];
  carInfo: ICarInfo[];
  carLaps: ICarLaps[];
  carStints: ICarStintInfo[];
  carPits: ICarPitInfo[];
  infoMessages: IMessage[];
  eventInfo: IEventInfo;
  trackInfo: ITrackInfo;
}

// manifests
export const ManifestsReducer = reducerWithInitialState(defaultManifests).case(
  RaceActions.processInboundManifests,
  (state, manifests) => {
    return postProcessManifest(manifests);
  },
);
// available cars
export const AvailableCarsReducer = reducerWithInitialState([] as ICarBaseData[]).case(
  RaceActions.updateAvailableCars,
  (state, cars) => {
    return [...cars];
  },
);

// available car classes
export const AvailableCarClassesReducer = reducerWithInitialState([] as ICarClass[]).case(
  RaceActions.updateAvailableCarClasses,
  (state, classes) => [...classes],
);

// car info
export const CarInfoReducer = reducerWithInitialState([] as ICarInfo[]).case(
  RaceActions.updateCarInfo,
  (state, data) => [...data],
);
// race graph
export const RaceGraphReducer = reducerWithInitialState([] as IRaceGraph[]).case(
  RaceActions.updateRaceGraph,
  (state, data) => [...data],
);

// car laps
export const CarLapsReducer = reducerWithInitialState([] as ICarLaps[]).case(
  RaceActions.updateCarLaps,
  (state, data) => [...data],
);

// car pits
export const CarStintsReducer = reducerWithInitialState([] as ICarStintInfo[]).case(
  RaceActions.updateCarStints,
  (state, data) => [...data],
);

// car pits
export const CarPitsReducer = reducerWithInitialState([] as ICarPitInfo[]).case(
  RaceActions.updateCarPits,
  (state, data) => [...data],
);

// session info
export const initialSessionInfo: IMessage = { msgType: 1, timestamp: 0, data: [] };
export const SessionInfoReducer = reducerWithInitialState(initialSessionInfo).case(
  RaceActions.updateSessionInfo,
  (state, info) => ({
    ...info,
  }),
);

// classification
export const initialClassification: IMessage = { msgType: 1, timestamp: 0, data: [] };
export const ClassificationReducer = reducerWithInitialState(initialClassification).case(
  RaceActions.updateClassification,
  (state, arg) => ({
    ...arg,
  }),
);

// info messages

export const InfoMessagesReducer = reducerWithInitialState([] as IMessage[]).case(
  RaceActions.updateInfoMessages,
  (state, arg) => [...arg],
);

// event info
export const initialEventInfo: IEventInfo = {
  name: "",
  trackId: 0,
  teamRacing: false,
  irSessionId: 0,
  trackDisplayName: "Default track",
  trackDisplayShortName: "track",
  trackConfigName: "",
  trackLength: 3000,
  eventTime: new Date().toISOString(),
  sectors: [],
  raceloggerVersion: "",
  multiClass: false,
  numCarClasses: 1,
  numCarTypes: 1,
};
export const EventInfoReducer = reducerWithInitialState(initialEventInfo).case(
  RaceActions.updateEventInfo,
  (state, arg) => ({ ...arg }),
);

export const initialTrackInfo: ITrackInfo = {
  trackId: 0,
  trackDisplayName: "Default track",
  trackDisplayShortName: "track",
  trackConfigName: "",
  trackLength: 3000,
  pit: { entry: -1, exit: -1, pitDelta: 0 },
  sectors: [],
};
export const TrackInfoReducer = reducerWithInitialState(initialTrackInfo).case(
  RaceActions.updateTrackInfo,
  (state, arg) => ({ ...arg }),
);

const combinedReducers = combineReducers<IRaceData>({
  manifests: ManifestsReducer,
  availableCars: AvailableCarsReducer,
  availableCarClasses: AvailableCarClassesReducer,
  sessionInfo: SessionInfoReducer,
  classification: ClassificationReducer,
  raceGraph: RaceGraphReducer,
  carInfo: CarInfoReducer,
  carLaps: CarLapsReducer,
  carStints: CarStintsReducer,
  carPits: CarPitsReducer,
  infoMessages: InfoMessagesReducer,
  eventInfo: EventInfoReducer,
  trackInfo: TrackInfoReducer,
});

export { combinedReducers as raceDataReducers };
