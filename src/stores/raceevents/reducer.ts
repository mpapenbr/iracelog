import { Reducer } from "redux";
import { RaceEventActionTypes } from "./actions";
import { IRaceEventsState } from "./types";

const initialState: IRaceEventsState = {
  data: [],
};

const reducer: Reducer<IRaceEventsState> = (state = initialState, action) => {
  switch (action.type) {
    case RaceEventActionTypes.SET_EVENTS:
      return { ...state, data: action.payload };

    default:
      return state;
  }
};

export { reducer as raceEventsReducer, initialState as raceEventsInitialState };
