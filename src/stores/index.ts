import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
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
  });

export function* rootSaga() {
  yield all([fork(raceEventsSaga)]);
  // yield all([fork(userSaga)]);
}
