import { Reducer } from "redux";
import { WampActionTypes } from "./actions";
import { defaultWampData, IWampState } from "./types";

const initialState: IWampState = {
  data: defaultWampData,
};

const reducer: Reducer<IWampState> = (state = initialState, action) => {
  switch (action.type) {
    case WampActionTypes.CONNECT: {
      // connectAndSubscribe();
      return state;
    }

    case WampActionTypes.CONNECTED:
      return { ...state, data: { ...state.data, connected: true } };

    case WampActionTypes.UPDATE_DUMMY: {
      return { ...state, data: { ...state.data, dummy: action.payload } };
    }
    default:
      return state;
  }
};

export { reducer as wampReducer, initialState as wampInitialState };
