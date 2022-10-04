import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { baseDataReducers, IBaseData } from "./basedata/reducer";
import { carDataReducers } from "./cars/reducers";
import { ICarInfoContainer } from "./cars/types";
import { IRaceData, raceDataReducers } from "./racedata/reducer";
import { raceEventsReducer } from "./raceevents/reducer";
import raceEventsSaga from "./raceevents/sagas";
import { IRaceEventsState } from "./raceevents/types";
import { speedmapReducers } from "./speedmap/reducer";
import { ISpeedmap } from "./speedmap/types";
import { uiReducer, userSettingsReducer } from "./ui/reducer";
import { IUiState, IUserSettings } from "./ui/types";
import { wampReducer } from "./wamp/reducer";
import { IWampState } from "./wamp/types";

export interface ApplicationState {
  raceEvents: IRaceEventsState;
  ui: IUiState;
  wamp: IWampState;
  userSettings: IUserSettings;
  raceData: IRaceData;
  baseData: IBaseData;
  speedmap: ISpeedmap;
  carData: ICarInfoContainer;
}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    raceEvents: raceEventsReducer, // will be removed
    ui: uiReducer, // will be removed
    wamp: wampReducer, // will be removed
    baseData: baseDataReducers,
    raceData: raceDataReducers, // this is new place for everything concerning the race data of a single event
    userSettings: userSettingsReducer, // this is the new place for user settings
    speedmap: speedmapReducers,
    carData: carDataReducers,
  });

export function* rootSaga() {
  yield all([fork(raceEventsSaga)]);
  // yield all([fork(userSaga)]);
}
