import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { eventDriverReducer } from "./drivers/reducer";
import eventDriversSaga from "./drivers/sagas";
import { raceEventsReducer } from "./raceevents/reducer";
import raceEventsSaga from "./raceevents/sagas";
import { IRaceEventsState } from "./raceevents/types";

export interface ApplicationState {
  raceEvents: IRaceEventsState;
}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    raceEvents: raceEventsReducer,
    eventDrivers: eventDriverReducer,
  });

export function* rootSaga() {
  yield all([fork(raceEventsSaga), fork(eventDriversSaga)]);
  // yield all([fork(userSaga)]);
}
