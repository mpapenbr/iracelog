import { all, put, takeLatest } from "redux-saga/effects";
import RaceEventService from "../../api/events";
import { IBaseAction } from "../../commons";
import { RaceEventActionTypes, setRaceEvents } from "./actions";
import { IRaceEvent } from "./types";

function* fetchRaceEvents(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const token: string = action.payload;

    const events = yield RaceEventService.raceEventList(token);
    yield put(setRaceEvents(events as IRaceEvent[]));
  } catch (e) {
    console.log(e);
  }
}

function* deleteRaceEvent(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id } = action.payload;
    console.log("about to delete " + id);
    yield RaceEventService.deleteEvent(token, id).then((v) => {
      console.log("deleted");
    });
    console.log("after  deleteEvent call");

    const events = yield RaceEventService.raceEventList(token);
    yield put(setRaceEvents(events as IRaceEvent[]));
  } catch (e) {
    console.log(e);
  }
}

export default function* raceEventsSaga() {
  yield all([
    yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENTS, fetchRaceEvents),
    yield takeLatest(RaceEventActionTypes.SAGA_DELETE_EVENT, deleteRaceEvent),
  ]);
}
