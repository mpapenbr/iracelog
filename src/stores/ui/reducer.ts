import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as UiActions from "./actions";
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
  IStandingsColumns,
  IStintRankingSettings,
  IStintsSettings,
  IStintSummarySettings,
  IStrategySettings,
  IUiState,
  IUserSettings,
} from "./types";

const initialState: IUiState = {
  data: defaultUiData,
};

const initialClassificationSettings: IClassificationSettings = { pageSize: 20, showCols: [] };
const ClassificationSettingsReducer = reducerWithInitialState(initialClassificationSettings).case(
  UiActions.classificationSettings,
  (state, settings) => ({
    ...settings,
  }),
);
const initialMessagesSettings: IMessagesSettings = { pageSize: 20 };
const MessagesSettingsReducer = reducerWithInitialState(initialMessagesSettings).case(
  UiActions.messagesSettings,
  (state, settings) => ({
    ...settings,
  }),
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
  (state, settings) => settings,
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
const RaceGraphRelativeSettingsReducer = reducerWithInitialState(
  initialRaceGraphRelativeSettings,
).case(UiActions.raceGraphRelativeSettings, (state, settings) => settings);

// RacePositions
const initialRacePositions: IRacePositionsSettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  showPosInClass: false,
};
const RacePositionsSettingsReducer = reducerWithInitialState(initialRacePositions).case(
  UiActions.racePositionsSettings,
  (state, settings) => settings,
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
  (state, settings) => settings,
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
  (state, settings) => settings,
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
  (state, settings) => settings,
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
  (state, settings) => settings,
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
  (state, settings) => settings,
);

// Strategy overview
const initialStrategy: IStrategySettings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
};
const StrategySettingsReducer = reducerWithInitialState(initialStrategy).case(
  UiActions.strategySettings,
  (state, settings) => settings,
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
  (state, settings) => settings,
);

// Stint rankings
const initialStintRanking: IStintRankingSettings = {
  filterCarClasses: [],
  showCars: [],
  selectableCars: [],
  minSessionTime: 0,
  maxSessionTime: 0,
  lowerRangeTime: 0,
  upperRangeTime: 0,
};
const StintRankingSettingsReducer = reducerWithInitialState(initialStintRanking).case(
  UiActions.stintRankingSettings,
  (state, settings) => settings,
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
  (state, settings) => settings,
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
  (state, settings) => settings,
);

export const initialGlobalSettings: IGlobalSettings = {
  syncSelection: true,
  filterOrderByPosition: true,
  showCars: [],
  filterCarClasses: [],
};
const GlobalSettingsReducer = reducerWithInitialState(initialGlobalSettings).case(
  UiActions.globalSettings,
  (state, settings) => settings,
);

const DemoReducer = reducerWithInitialState(0).case(
  UiActions.demoSettings,
  (state, value) => value,
);

const initialAvailableStandingsColumns: IStandingsColumns = {
  availableColumns: [],
};
const AvailableStandingColumnsReducer = reducerWithInitialState(
  initialAvailableStandingsColumns,
).case(UiActions.updateAvailableStandingsColumns, (state, data) => data);

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
  standingsColumns: initialAvailableStandingsColumns,
  stintRanking: initialStintRanking,
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
  standingsColumns: AvailableStandingColumnsReducer,
  stintRanking: StintRankingSettingsReducer,
  counter: DemoReducer,
});

export { initialState as uiInitialState, combinedReducers as userSettingsReducer };
