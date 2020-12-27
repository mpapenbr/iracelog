import { Reducer } from "redux";
import { EventDriverActionTypes } from "./actions";
import { IEventDriverState } from "./types";

const initialState: IEventDriverState = {
  data: [],
};

const reducer: Reducer<IEventDriverState> = (state = initialState, action) => {
  switch (action.type) {
    case EventDriverActionTypes.SET_EVENT_DRIVERS:
      return { ...state, data: action.payload };

    default:
      return state;
  }
};

export { reducer as eventDriverReducer, initialState as eventDriversInitialState };
