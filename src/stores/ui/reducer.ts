import { combineReducers, Reducer } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as UiActions from "./actions";
import { UiActionTypes } from "./actions";
import {
  defaultUiData,
  IClassificationSettings,
  IDriverLapsSettings,
  IDriverStintsSettings as IDriverStintsSettings,
  IMessagesSettings,
  IPitstopsSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionsSettings,
  IStintsSettings,
  IUiState,
  IUserSettings,
  UiComponent,
} from "./types";

const initialState: IUiState = {
  data: defaultUiData,
};

const reducer: Reducer<IUiState> = (state = initialState, action) => {
  switch (action.type) {
    case UiActionTypes.UPDATE_BRUSH_SETTINGS: {
      switch (action.payload.component) {
        case UiComponent.DRIVER_LAPS: {
          const newBrushRange = { ...state.data.driverLapsSettings, brushRange: action.payload.data };
          return { ...state, data: { ...state.data, driverLapsSettings: newBrushRange } };
        }
        case UiComponent.RACE_GRAPH_LEADER: {
          const newBrushRange = { ...state.data.raceGraphSettings, brushRange: action.payload.data };
          return { ...state, data: { ...state.data, raceGraphSettings: newBrushRange } };
        }
        case UiComponent.RACE_GRAPH_CAR: {
          const newBrushRange = { ...state.data.raceGraphRelativeSettings, brushRange: action.payload.data };
          return { ...state, data: { ...state.data, raceGraphRelativeSettings: newBrushRange } };
        }
      }
      return state;
    }

    case UiActionTypes.SET_STINT_NO:
      return { ...state, data: { ...state.data, stint: { ...state.data.stint, stintNo: action.payload } } };
    case UiActionTypes.SHOW_ENTRY_DETAILS:
      return { ...state, data: { ...state.data, entries: { ...state.data.entries, entryDetails: action.payload } } };

    default:
      return state;
  }
};

const initialClassificationSettings: IClassificationSettings = { pageSize: 20 };
const ClassificationSettingsReducer = reducerWithInitialState(initialClassificationSettings).case(
  UiActions.classificationSettings,
  (state, settings) => ({
    ...settings,
  })
);
const initialMessagesSettings: IMessagesSettings = { pageSize: 20 };
const MessagesSettingsReducer = reducerWithInitialState(initialMessagesSettings).case(
  UiActions.messagesSettings,
  (state, settings) => ({
    ...settings,
  })
);
// RaceGraphSettings
const initialRaceGraphSettings: IRaceGraphSettings = {
  showCars: [],
  filterCarClasses: [],
  deltaRange: 120,
  gapRelativeToClassLeader: false,
};
const RaceGraphSettingsReducer = reducerWithInitialState(initialRaceGraphSettings).case(
  UiActions.raceGraphSettings,
  (state, settings) => settings
);

// RaceGraphRelativeSettings
const initialRaceGraphRelativeSettings: IRaceGraphRelativeSettings = {
  showCars: [],
  filterCarClasses: [],
  deltaRange: 120,
  referenceCarNum: undefined,
};
const RaceGraphRelativeSettingsReducer = reducerWithInitialState(initialRaceGraphRelativeSettings).case(
  UiActions.raceGraphRelativeSettings,
  (state, settings) => settings
);

// RacePositions
const initialRacePositions: IRacePositionsSettings = {
  showCars: [],
  filterCarClasses: [],
  showPosInClass: false,
};
const RacePositionsSettingsReducer = reducerWithInitialState(initialRacePositions).case(
  UiActions.racePositionsSettings,
  (state, settings) => settings
);

// DriverLaps
const initialDriverLaps: IDriverLapsSettings = {
  showCars: [],
  filterCarClasses: [],
  filterSecs: 2,
};
const DriverLapsSettingsReducer = reducerWithInitialState(initialDriverLaps).case(
  UiActions.driverLapsSettings,
  (state, settings) => settings
);

// Pitstops
const initialPitstops: IPitstopsSettings = {
  showCars: [],
  filterCarClasses: [],
};
const PitstopsSettingsReducer = reducerWithInitialState(initialPitstops).case(
  UiActions.pitstopsSettings,
  (state, settings) => settings
);

// Stints
const initialStints: IStintsSettings = {
  showCars: [],
  filterCarClasses: [],
  showAsLabel: "duration",
};
const StintsSettingsReducer = reducerWithInitialState(initialStints).case(
  UiActions.stintsSettings,
  (state, settings) => settings
);

// DriverStints
const initialDriverStints: IDriverStintsSettings = {
  carNum: "",
  filterCarClasses: [],
  filterSecs: 2,
  filterInOut: true,
  showStint: 0,
};
const DriverStintsSettingsReducer = reducerWithInitialState(initialDriverStints).case(
  UiActions.driverStintsSettings,
  (state, settings) => settings
);
export const defaultStateData: IUserSettings = {
  classification: initialClassificationSettings,
  messages: initialMessagesSettings,
  raceGraph: initialRaceGraphSettings,
  raceGraphRelative: initialRaceGraphRelativeSettings,
  racePositions: initialRacePositions,
  driverLaps: initialDriverLaps,
  pitstops: initialPitstops,
  stints: initialStints,
  driverStints: initialDriverStints,
};
const combinedReducers = combineReducers<IUserSettings>({
  classification: ClassificationSettingsReducer,
  messages: MessagesSettingsReducer,
  raceGraph: RaceGraphSettingsReducer,
  raceGraphRelative: RaceGraphRelativeSettingsReducer,
  racePositions: RacePositionsSettingsReducer,
  driverLaps: DriverLapsSettingsReducer,
  pitstops: PitstopsSettingsReducer,
  stints: StintsSettingsReducer,
  driverStints: DriverStintsSettingsReducer,
});

export { reducer as uiReducer, initialState as uiInitialState, combinedReducers as userSettingsReducer };
