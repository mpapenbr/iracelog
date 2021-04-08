import { Reducer } from "redux";
import { UiActionTypes } from "./actions";
import { defaultUiData, IUiState, UiComponent } from "./types";

const initialState: IUiState = {
  data: defaultUiData,
};

const reducer: Reducer<IUiState> = (state = initialState, action) => {
  switch (action.type) {
    case UiActionTypes.RESET:
      return { ...state, data: { ...defaultUiData } };
    case UiActionTypes.UPDATE_BRUSH_SETTINGS: {
      switch (action.payload.component) {
        case UiComponent.DRIVER_LAPS:
          const newDriverLapsSettings = { ...state.data.driverLapsSettings, brushInterval: action.payload.data };
          return { ...state, data: { ...state.data, driverLapsSettings: newDriverLapsSettings } };
      }
      return state;
    }

    case UiActionTypes.SET_STINT_NO:
      return { ...state, data: { ...state.data, stint: { ...state.data.stint, stintNo: action.payload } } };
    case UiActionTypes.SHOW_ENTRY_DETAILS:
      return { ...state, data: { ...state.data, entries: { ...state.data.entries, entryDetails: action.payload } } };
    case UiActionTypes.DRIVER_LAPS_SETTINGS:
      return { ...state, data: { ...state.data, driverLapsSettings: { ...action.payload } } };
    case UiActionTypes.RACE_GRAPH_SETTINGS:
      return { ...state, data: { ...state.data, raceGraphSettings: { ...action.payload } } };
    case UiActionTypes.RACE_GRAPH_RELATIVE_SETTINGS:
      return { ...state, data: { ...state.data, raceGraphRelativeSettings: { ...action.payload } } };
    case UiActionTypes.RACE_POSITION_SETTINGS:
      return { ...state, data: { ...state.data, racePositionSettings: { ...action.payload } } };
    case UiActionTypes.RACE_STINT_SHARED_SETTINGS:
      return { ...state, data: { ...state.data, raceStintSharedSettings: { ...action.payload } } };
    default:
      return state;
  }
};

export { reducer as uiReducer, initialState as uiInitialState };
