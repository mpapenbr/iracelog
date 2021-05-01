import _ from "lodash";
import { all, put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "..";
import RaceEventService from "../../api/events";
import { IBaseAction } from "../../commons";
import { IDriverMeta } from "../drivers/types";
import { ICarStintData } from "../types/stints";
import { uiSetStintNo, uiShowEntryDetails } from "../ui/actions";
import {
  RaceEventActionTypes,
  resetEventData,
  setEventDrivers,
  setEventLoaded,
  setEventMain,
  setEventStints,
  setEventStintsLoaded,
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
    yield put(resetEventData());
    yield put(setEventMain(mainData as IRaceEvent));
    yield put(setEventSummary(summary as IEventSummary));
    yield put(setEventDrivers(drivers as IDriverMeta[]));
    yield put(setEventLoaded(id));
    // reset UI-Settings
    yield put(uiSetStintNo(0));
    yield put(uiShowEntryDetails(-1));
  } catch (e) {
    console.log(e);
  }
}

function* fetchEventStints(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id, sessionNum } = action.payload;
    console.log("fetch event stints ", action.payload);
    const carStints = yield RaceEventService.allSessionStints(token, id, sessionNum);

    yield put(setEventStints(carStints as ICarStintData[]));

    yield put(setEventStintsLoaded(id));
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
    if (rc.id === id && rc.eventLoaded) {
      console.log("early leave. event data " + id + " already present.");
      return;
    }
    yield fetchEventData(action);
  } catch (e) {
    console.log(e);
  }
}

function* ensureEventStints(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id } = action.payload;
    console.log("ensure event data " + id);
    const rc: IRaceContainer = (yield select((state: ApplicationState) => state.raceEvents.current)) as IRaceContainer;
    if (rc.id === id && rc.carStintsLoaded) {
      console.log("early leave. event data " + id + " already present.");
      return;
    }
    yield fetchEventData(action);
    const rc2: IRaceContainer = (yield select((state: ApplicationState) => state.raceEvents.current)) as IRaceContainer;
    const raceSession = _.last(rc2.summary.sessionSummaries)?.sessionNum;
    const newAction = { ...action, payload: { ...action.payload, sessionNum: raceSession } };
    yield fetchEventStints(newAction);
  } catch (e) {
    console.log(e);
  }
}

function* dummy(action: IBaseAction): Generator<string, string, string> {
  return "dummy";
}
export default function* raceEventsSaga() {
  yield all([
    takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENTS, dummy),
    // yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENTS, fetchRaceEvents),
    // yield takeLatest(RaceEventActionTypes.SAGA_DELETE_EVENT, deleteRaceEvent),
    // yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENT_DATA, fetchEventData),
    // yield takeLatest(RaceEventActionTypes.SAGA_ENSURE_EVENT_DATA, ensureEventData),
    // yield takeLatest(RaceEventActionTypes.SAGA_LOAD_EVENT_STINT_DATA, fetchEventStints),
    // yield takeLatest(RaceEventActionTypes.SAGA_ENSURE_EVENT_STINT_DATA, ensureEventStints),
  ]);
}
