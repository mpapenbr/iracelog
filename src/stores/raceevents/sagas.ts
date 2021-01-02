import { all, put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "..";
import RaceEventService from "../../api/events";
import { IBaseAction } from "../../commons";
import { IDriverMeta } from "../drivers/types";
import {
  RaceEventActionTypes,
  setEventDrivers,
  setEventLoaded,
  setEventMain,
  setEventSummary,
  setRaceEvents,
} from "./actions";
import { IEventSummary, IRaceContainer, IRaceEvent } from "./types";

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

function* fetchEventData(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id } = action.payload;
    console.log("fetch event data ", action.payload);
    const mainData = yield RaceEventService.raceEvent(token, id);
    const summary = yield RaceEventService.eventSummary(token, id);
    const drivers = yield RaceEventService.eventDrivers(token, id);
    yield put(setEventMain(mainData as IRaceEvent));
    yield put(setEventSummary(summary as IEventSummary));
    yield put(setEventDrivers(drivers as IDriverMeta[]));
    yield put(setEventLoaded(id));
  } catch (e) {
    console.log(e);
  }
}

function* ensureEventData(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id } = action.payload;
    console.log("ensure event data " + id);
    const rc: IRaceContainer = (yield select((state: ApplicationState) => state.raceEvents.current)) as IRaceContainer;
    if (rc.id === id && rc.loaded) {
      console.log("early leave. event data " + id + " already present.");
      return;
    }
    yield fetchEventData(action);
  } catch (e) {
    console.log(e);
  }
}

export default function* raceEventsSaga() {
  yield all([
    yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENTS, fetchRaceEvents),
    yield takeLatest(RaceEventActionTypes.SAGA_DELETE_EVENT, deleteRaceEvent),
    yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENT_DATA, fetchEventData),
    yield takeLatest(RaceEventActionTypes.SAGA_ENSURE_EVENT_DATA, ensureEventData),
  ]);
}
