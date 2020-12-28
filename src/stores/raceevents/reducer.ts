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
    case RaceEventActionTypes.SET_EVENT_SUMMARY:
      return { ...state, current: { ...state.current, summary: action.payload } };

    default:
      return state;
  }
};

export { reducer as raceEventsReducer, initialState as raceEventsInitialState };
