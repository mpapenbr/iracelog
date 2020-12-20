import { all, call, put, takeLatest } from "redux-saga/effects";
import RaceEventService from "../../api/events";
import { IBaseAction } from "../../commons";
import { loadRaceEvents, RaceEventActionTypes, setRaceEvents } from "./actions";
import { IRaceEvent } from "./types";

function* fetchRaceEvents(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const token: string = action.payload;

    yield call(loadRaceEvents);
    const events = yield RaceEventService.raceEventList(token);
    yield put(setRaceEvents(events as IRaceEvent[]));
  } catch (e) {
    console.log(e);
  }
}

export default function* raceEventsSaga() {
  yield all([yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENTS, fetchRaceEvents)]);
}
