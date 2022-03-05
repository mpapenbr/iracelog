import { combineReducers, Reducer } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as UiActions from "./actions";
import { UiActionTypes } from "./actions";
import {
  defaultUiData,
  ICircleOfDoomSettings,
  IClassificationSettings,
  IDashboardSettings,
  IDriverLapsSettings,
  IDriverStintsSettings,
  IGlobalSettings,
  IMessagesSettings,
  IPitstopsSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionsSettings,
  IReplaySettings,
  IStintsSettings,
  IStintSummarySettings,
  IStrategySettings,
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

const initialClassificationSettings: IClassificationSettings = { pageSize: 20, showCols: [] };
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
  selectableCars: [],
  filterCarClasses: [],
  deltaRange: 120,
  limitLastLaps: 30,
  gapRelativeToClassLeader: false,
};
const RaceGraphSettingsReducer = reducerWithInitialState(initialRaceGraphSettings).case(
  UiActions.raceGraphSettings,
  (state, settings) => settings
);

// RaceGraphRelativeSettings
const initialRaceGraphRelativeSettings: IRaceGraphRelativeSettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  deltaRange: 120,
  limitLastLaps: 30,
  referenceCarNum: undefined,
};
const RaceGraphRelativeSettingsReducer = reducerWithInitialState(initialRaceGraphRelativeSettings).case(
  UiActions.raceGraphRelativeSettings,
  (state, settings) => settings
);

// RacePositions
const initialRacePositions: IRacePositionsSettings = {
  showCars: [],
  selectableCars: [],
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
  selectableCars: [],
  filterCarClasses: [],
  filterSecs: 2,
  limitLastLaps: 30,
};
const DriverLapsSettingsReducer = reducerWithInitialState(initialDriverLaps).case(
  UiActions.driverLapsSettings,
  (state, settings) => settings
);

// Pitstops
const initialPitstops: IPitstopsSettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  hideLongPitstops: false,
  hideThreshold: 300, //
  showRunningOnly: true,
};
const PitstopsSettingsReducer = reducerWithInitialState(initialPitstops).case(
  UiActions.pitstopsSettings,
  (state, settings) => settings
);

// Stints
const initialStints: IStintsSettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  showAsLabel: "duration",
  showRunningOnly: true,
};
const StintsSettingsReducer = reducerWithInitialState(initialStints).case(
  UiActions.stintsSettings,
  (state, settings) => settings
);

// Stint summary (single selection)
const initialStintSummary: IStintSummarySettings = {
  selectableCars: [],
  filterCarClasses: [],
  deltaRange: 120,
  carNum: undefined,
};
const StintSummarySettingsReducer = reducerWithInitialState(initialStintSummary).case(
  UiActions.stintSummarySettings,
  (state, settings) => settings
);

// Dashboard
const initialDashboard: IDashboardSettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  deltaRange: 10,
  limitLastLaps: 30,
};
const DashboardSettingsReducer = reducerWithInitialState(initialDashboard).case(
  UiActions.dashboardSettings,
  (state, settings) => settings
);

// Strategy overview
const initialStrategy: IStrategySettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
};
const StrategySettingsReducer = reducerWithInitialState(initialStrategy).case(
  UiActions.strategySettings,
  (state, settings) => settings
);

// DriverStints
const initialDriverStints: IDriverStintsSettings = {
  carNum: "",
  selectableCars: [],
  filterCarClasses: [],
  filterSecs: 2,
  filterInOut: true,
  showStint: 0,
};
const DriverStintsSettingsReducer = reducerWithInitialState(initialDriverStints).case(
  UiActions.driverStintsSettings,
  (state, settings) => settings
);

// CircleOfDoomSettings
const initialCircleOfDoom: ICircleOfDoomSettings = {
  referenceCarNum: "",
  pitstopTime: 0,
  calcSpeed: 0,
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
};
const CircleOfDoomSettingsReducer = reducerWithInitialState(initialCircleOfDoom).case(
  UiActions.circleOfDoomSettings,
  (state, settings) => settings
);

// ReplaySettings
export const initialReplaySettings: IReplaySettings = {
  enabled: false,
  eventKey: "",
  eventId: 0,
  minTimestamp: 0,
  minSessionTime: 0,
  maxSessionTime: 0,
  currentSessionTime: 0,
  currentTimestamp: 0,
  playing: false,
  playSpeed: 0,
  timerHandle: 0,
};
const ReplaySettingsReducer = reducerWithInitialState(initialReplaySettings).case(
  UiActions.replaySettings,
  (state, settings) => settings
);

export const initialGlobalSettings: IGlobalSettings = {
  syncSelection: true,
  filterOrderByPosition: false,
  showCars: [],
  filterCarClasses: [],
};
const GlobalSettingsReducer = reducerWithInitialState(initialGlobalSettings).case(
  UiActions.globalSettings,
  (state, settings) => settings
);

const DemoReducer = reducerWithInitialState(0).case(UiActions.demoSettings, (state, value) => value);

export const defaultStateData: IUserSettings = {
  classification: initialClassificationSettings,
  messages: initialMessagesSettings,
  raceGraph: initialRaceGraphSettings,
  raceGraphRelative: initialRaceGraphRelativeSettings,
  racePositions: initialRacePositions,
  driverLaps: initialDriverLaps,
  pitstops: initialPitstops,
  stints: initialStints,
  stintSummary: initialStintSummary,
  dashboard: initialDashboard,
  strategy: initialStrategy,
  driverStints: initialDriverStints,
  circleOfDoom: initialCircleOfDoom,
  replay: initialReplaySettings,
  global: initialGlobalSettings,
  counter: 0,
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
  stintSummary: StintSummarySettingsReducer,
  dashboard: DashboardSettingsReducer,
  strategy: StrategySettingsReducer,
  driverStints: DriverStintsSettingsReducer,
  circleOfDoom: CircleOfDoomSettingsReducer,
  replay: ReplaySettingsReducer,
  global: GlobalSettingsReducer,
  counter: DemoReducer,
});

export { reducer as uiReducer, initialState as uiInitialState, combinedReducers as userSettingsReducer };
