import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { raceEventsReducer } from "./raceevents/reducer";
import raceEventsSaga from "./raceevents/sagas";
import { IRaceEventsState } from "./raceevents/types";
import { uiReducer } from "./ui/reducer";
import { IUiState } from "./ui/types";
import { wampReducer } from "./wamp/reducer";
import { IWampState } from "./wamp/types";

export interface ApplicationState {
  raceEvents: IRaceEventsState;
  ui: IUiState;
  wamp: IWampState;
}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    raceEvents: raceEventsReducer,
    ui: uiReducer,
    wamp: wampReducer,
  });

export function* rootSaga() {
  yield all([fork(raceEventsSaga)]);
  // yield all([fork(userSaga)]);
}
