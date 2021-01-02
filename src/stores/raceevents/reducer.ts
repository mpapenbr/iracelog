import { Reducer } from "redux";
import { RaceEventActionTypes } from "./actions";
import { defaultRaceContainer, IRaceEventsState } from "./types";

const initialState: IRaceEventsState = {
  data: [],
  current: defaultRaceContainer,
};

const reducer: Reducer<IRaceEventsState> = (state = initialState, action) => {
  switch (action.type) {
    case RaceEventActionTypes.SET_EVENTS:
      return { ...state, data: action.payload };
    case RaceEventActionTypes.SET_EVENT_MAIN_DATA:
      return { ...state, current: { ...state.current, eventData: action.payload } };
    case RaceEventActionTypes.SET_EVENT_SUMMARY:
      return { ...state, current: { ...state.current, summary: action.payload } };
    case RaceEventActionTypes.SET_EVENT_DRIVERS:
      return { ...state, current: { ...state.current, drivers: action.payload } };
    case RaceEventActionTypes.SET_EVENT_LOADED:
      return { ...state, current: { ...state.current, loaded: true, id: action.payload } };
    case RaceEventActionTypes.RESET_EVENT_DATA:
      return { ...state, current: defaultRaceContainer };

    default:
      return state;
  }
};

export { reducer as raceEventsReducer, initialState as raceEventsInitialState };
