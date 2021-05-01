import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { baseDataReducers } from "./basedata/reducer";
import { IRaceData, raceDataReducers } from "./racedata/reducer";
import { raceEventsReducer } from "./raceevents/reducer";
import raceEventsSaga from "./raceevents/sagas";
import { IRaceEventsState } from "./raceevents/types";
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
}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    raceEvents: raceEventsReducer, // will be removed
    ui: uiReducer, // will be removed
    wamp: wampReducer, // will be removed
    baseData: baseDataReducers, // hmmmm, still thinking: as of now: will be removed
    raceData: raceDataReducers, // this is new place for everything concerning the race data of a single event
    userSettings: userSettingsReducer, // this is the new place for user settings
  });

export function* rootSaga() {
  yield all([fork(raceEventsSaga)]);
  // yield all([fork(userSaga)]);
}
