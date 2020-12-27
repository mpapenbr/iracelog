import { all, put, takeLatest } from "redux-saga/effects";
import RaceEventService from "../../api/events";
import { IBaseAction } from "../../commons";
import { EventDriverActionTypes, setEventDrivers } from "./actions";
import { IDriverMeta } from "./types";

function* fetchEventDrivers(
  action: IBaseAction
): //: Generator<StrictEffect,void, Stint[]>
Generator {
  try {
    const { token, id } = action.payload;

    const events = yield RaceEventService.eventDrivers(token, id);
    yield put(setEventDrivers(events as IDriverMeta[]));
  } catch (e) {
    console.log(e);
  }
}

export default function* eventDriversSaga() {
  yield all([yield takeLatest(EventDriverActionTypes.SAGA_LOAD_EVENT_DRIVERS, fetchEventDrivers)]);
}
