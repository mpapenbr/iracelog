import { Reducer } from "redux";
import { UiActionTypes } from "./actions";
import { defaultUiData, IUiState } from "./types";

const initialState: IUiState = {
  data: defaultUiData,
};

const reducer: Reducer<IUiState> = (state = initialState, action) => {
  switch (action.type) {
    case UiActionTypes.SET_STINT_NO:
      return { ...state, data: { ...state.data, stint: { ...state.data.stint, stintNo: action.payload } } };
    default:
      return state;
  }
};

export { reducer as uiReducer, initialState as uiInitialState };
