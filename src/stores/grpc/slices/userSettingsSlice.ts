import { ReplayInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/event/v1/event_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { combineSlices, createSlice } from "@reduxjs/toolkit";
import {
  ICircleOfDoomSettings,
  IClassificationSettings,
  IColumnInfo,
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
  IStintSummarySettings,
  IStintsSettings,
  IStrategySettings,
} from "./types";

interface IUserSettings {
  classification: IClassificationSettings;
  // messages: IMessagesSettings;
  // raceGraph: IRaceGraphSettings;
  // raceGraphRelative: IRaceGraphRelativeSettings;
  // racePositions: IRacePositionsSettings;
  // driverLaps: IDriverLapsSettings;
  // pitstops: IPitstopsSettings;
  // stints: IStintsSettings;
  // stintSummary: IStintSummarySettings;
  // stintRanking: IStintRankingSettings;

  // dashboard: IDashboardSettings;
  // strategy: IStrategySettings;
  // driverStints: IDriverStintsSettings;
  // circleOfDoom: ICircleOfDoomSettings;
  // replay: IReplaySettings;
  // global: IGlobalSettings;
  standingsColumns: IStandingsColumns;
}
const initialStateGlobalSettings = {
  syncSelection: true,
  filterOrderByPosition: true,
  showCars: [],
  filterCarClasses: [],
  referenceCarNum: "",
  theme: "light",
  useCompact: false,
} as IGlobalSettings;
const globalSettings = createSlice({
  name: "globalSettings",
  initialState: initialStateGlobalSettings,
  reducers: {
    updateGlobalSettings(state, action: PayloadAction<IGlobalSettings>) {
      return action.payload;
    },
    toggleSyncSelection(state) {
      state.syncSelection = !state.syncSelection;
    },
    toggleFilterOrderByPosition(state) {
      state.filterOrderByPosition = !state.filterOrderByPosition;
    },
    setTheme(state, action: PayloadAction<string>) {
      if (["light", "dark", "dimmed"].includes(action.payload)) {
        state.theme = action.payload;
      }
    },
    toggleCompact(state) {
      state.useCompact = !state.useCompact;
    },
    resetGlobalSettings() {
      return initialStateGlobalSettings;
    },
  },
});
const initialStateStandings = { availableColumns: [] as IColumnInfo[] };
const standingsColumns = createSlice({
  name: "standingsColumnsSettings",
  initialState: initialStateStandings,
  reducers: {
    updateStandingColumns(state, action: PayloadAction<IStandingsColumns>) {
      return action.payload;
    },
    resetStandingsColumns(state) {
      return initialStateStandings;
    },
  },
});
const initialStateClassification = { pageSize: 20, showCols: [] } as IClassificationSettings;
const classificationSettings = createSlice({
  name: "classificationSettings",
  initialState: initialStateClassification,
  reducers: {
    updateClassification(state, action: PayloadAction<IClassificationSettings>) {
      return action.payload;
    },
    resetClassification(state) {
      return initialStateClassification;
    },
  },
});
const initialStateCircleOfDoom = {
  referenceCarNum: "",
  pitstopTime: 0,
  calcSpeed: 0,
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
} as ICircleOfDoomSettings;
const circleOfDoom = createSlice({
  name: "circleOfDoomSettings",
  initialState: initialStateCircleOfDoom,
  reducers: {
    updateCircleOfDoom(state, action: PayloadAction<ICircleOfDoomSettings>) {
      return action.payload;
    },
    resetCircleOfDoom() {
      return initialStateCircleOfDoom;
    },
  },
});
const initialStateStrategy = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
} as IStrategySettings;
const strategy = createSlice({
  name: "strategySettings",
  initialState: initialStateStrategy,
  reducers: {
    updateStrategy(state, action: PayloadAction<IStrategySettings>) {
      return action.payload;
    },
    resetStrategy() {
      return initialStateStrategy;
    },
  },
});
const initialStateStints = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  showAsLabel: "duration",
  showRunningOnly: true,
} as IStintsSettings;
const stints = createSlice({
  name: "stintsSettings",
  initialState: initialStateStints,
  reducers: {
    updateStints(state, action: PayloadAction<IStintsSettings>) {
      return action.payload;
    },
    resetStints() {
      return initialStateStints;
    },
  },
});
const initialStatePits = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  hideLongPitstops: false,
  hideThreshold: 300, //
  showRunningOnly: true,
} as IPitstopsSettings;
const pits = createSlice({
  name: "pitsSettings",
  initialState: initialStatePits,
  reducers: {
    updatePits(state, action: PayloadAction<IPitstopsSettings>) {
      return action.payload;
    },
    resetPits() {
      return initialStatePits;
    },
  },
});
const initialStateStintSummary = {
  selectableCars: [],
  filterCarClasses: [],
  deltaRange: 120,
} as IStintSummarySettings;
const stintSummary = createSlice({
  name: "stintSummarySettings",
  initialState: initialStateStintSummary,
  reducers: {
    updateStintSummary(state, action: PayloadAction<IStintSummarySettings>) {
      return action.payload;
    },
    resetStintSummary() {
      return initialStateStintSummary;
    },
  },
});
const initialStateDriverStints = {
  carNum: "",
  selectableCars: [],
  filterCarClasses: [],
  filterSecs: 2,
  filterInOut: true,
  showStint: 0,
} as IDriverStintsSettings;
const driverStints = createSlice({
  name: "driverStintsSettings",
  initialState: initialStateDriverStints,
  reducers: {
    updateDriverStints(state, action: PayloadAction<IDriverStintsSettings>) {
      return action.payload;
    },
    resetDriverStints() {
      return initialStateDriverStints;
    },
  },
});
const initialStateDriverLaps = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  filterSecs: 2,
  limitLastLaps: 30,
} as IDriverLapsSettings;
const driverLaps = createSlice({
  name: "driverLapsSettings",
  initialState: initialStateDriverLaps,
  reducers: {
    updateDriverLaps(state, action: PayloadAction<IDriverLapsSettings>) {
      return action.payload;
    },
    resetDriverLaps() {
      return initialStateDriverLaps;
    },
  },
});

const initialStateRaceGraph = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  gapRelativeToClassLeader: false,
  deltaRange: 120,
  limitLastLaps: 30,
} as IRaceGraphSettings;
const raceGraph = createSlice({
  name: "raceGraphSettings",
  initialState: initialStateRaceGraph,
  reducers: {
    updateRaceGraph(state, action: PayloadAction<IRaceGraphSettings>) {
      return action.payload;
    },
    resetRaceGraph() {
      return initialStateRaceGraph;
    },
  },
});

const initialStateRaceGraphRelative = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  gapRelativeToClassLeader: false,
  deltaRange: 120,
  limitLastLaps: 30,
} as IRaceGraphRelativeSettings;
const raceGraphRelative = createSlice({
  name: "raceGraphRelativeSettings",
  initialState: initialStateRaceGraphRelative,
  reducers: {
    updateRaceGraphRelative(state, action: PayloadAction<IRaceGraphRelativeSettings>) {
      return action.payload;
    },
    resetRaceGraphRelative() {
      return initialStateRaceGraphRelative;
    },
  },
});
const initialStateRacePositions = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  showPosInClass: false,
} as IRacePositionsSettings;
const racePositions = createSlice({
  name: "racePositionsSettings",
  initialState: initialStateRacePositions,
  reducers: {
    updateRacePositions(state, action: PayloadAction<IRacePositionsSettings>) {
      return action.payload;
    },
    resetRacePositions() {
      return initialStateRacePositions;
    },
  },
});
const initialStateStintRankings = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  minSessionTime: 0,
  maxSessionTime: 0,
  lowerRangeTime: 0,
  upperRangeTime: 0,
} as IStintRankingSettings;
const stintRankings = createSlice({
  name: "stintRankingSettings",
  initialState: initialStateStintRankings,
  reducers: {
    updateStintRankings(state, action: PayloadAction<IStintRankingSettings>) {
      return action.payload;
    },
    updateStintRankingsRange(state, action: PayloadAction<ReplayInfo>) {
      state.minSessionTime = action.payload.minSessionTime;
      state.maxSessionTime = action.payload.maxSessionTime;
      state.lowerRangeTime = action.payload.minSessionTime;
      state.upperRangeTime = action.payload.maxSessionTime;
    },
    resetStintRankings() {
      return initialStateStintRankings;
    },
  },
});

const initialStateDashboard = {
  showCars: [],
  selectableCars: [],
  filterCarClasses: [],
  gapRelativeToClassLeader: false,
  deltaRange: 120,
  limitLastLaps: 30,
} as IDashboardSettings;
const dashboard = createSlice({
  name: "dashboardSettings",
  initialState: initialStateDashboard,
  reducers: {
    updateDashboard(state, action: PayloadAction<IDashboardSettings>) {
      return action.payload;
    },
    resetDashboard() {
      return initialStateDashboard;
    },
  },
});
const initialStateReplay = {
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
} as IReplaySettings;
const replay = createSlice({
  name: "replaySettings",
  initialState: initialStateReplay,
  reducers: {
    updateReplay(state, action: PayloadAction<IReplaySettings>) {
      return action.payload;
    },
    updateReplayInfo(state, action: PayloadAction<ReplayInfo>) {
      // state.minTimestamp = +(action.payload.minTimestamp?.seconds ?? 0);
      state.minSessionTime = action.payload.minSessionTime;
      state.maxSessionTime = action.payload.maxSessionTime;
    },

    resetReplay() {
      return initialStateReplay;
    },
  },
});
const initialStateMessages = {
  pageSize: 20,
} as IMessagesSettings;
const messages = createSlice({
  name: "messageSettings",
  initialState: initialStateMessages,
  reducers: {
    updateMessages(state, action: PayloadAction<IMessagesSettings>) {
      return action.payload;
    },
    resetMessages() {
      return initialStateMessages;
    },
  },
});

export const combined = combineSlices(
  globalSettings,
  standingsColumns,
  classificationSettings,
  circleOfDoom,
  strategy,
  stints,
  pits,
  stintSummary,
  driverStints,
  driverLaps,
  raceGraph,
  raceGraphRelative,
  racePositions,
  stintRankings,
  dashboard,
  replay,
  messages,
  {
    global: globalSettings.reducer,
    classification: classificationSettings.reducer,
    standingsColumns: standingsColumns.reducer,
    circleOfDoom: circleOfDoom.reducer,
    strategy: strategy.reducer,
    stints: stints.reducer,
    pits: pits.reducer,
    stintSummary: stintSummary.reducer,
    driverStints: driverStints.reducer,
    driverLaps: driverLaps.reducer,
    raceGraph: raceGraph.reducer,
    raceGraphRelative: raceGraphRelative.reducer,
    racePositions: racePositions.reducer,
    stintRankings: stintRankings.reducer,
    dashboard: dashboard.reducer,
    replay: replay.reducer,
    messages: messages.reducer,
  },
);

export const {
  updateGlobalSettings,
  resetGlobalSettings,
  toggleFilterOrderByPosition,
  toggleSyncSelection,
  toggleCompact,
  setTheme,
} = globalSettings.actions;
export const { updateStandingColumns, resetStandingsColumns } = standingsColumns.actions;
export const { updateClassification, resetClassification } = classificationSettings.actions;
export const { updateCircleOfDoom, resetCircleOfDoom } = circleOfDoom.actions;
export const { updateStrategy, resetStrategy } = strategy.actions;
export const { updateStints, resetStints } = stints.actions;
export const { updatePits, resetPits } = pits.actions;
export const { updateStintSummary, resetStintSummary } = stintSummary.actions;
export const { updateDriverStints, resetDriverStints } = driverStints.actions;
export const { updateDriverLaps, resetDriverLaps } = driverLaps.actions;
export const { updateRaceGraph, resetRaceGraph } = raceGraph.actions;
export const { updateRaceGraphRelative, resetRaceGraphRelative } = raceGraphRelative.actions;
export const { updateRacePositions, resetRacePositions } = racePositions.actions;
export const { updateStintRankings, updateStintRankingsRange, resetStintRankings } =
  stintRankings.actions;
export const { updateDashboard, resetDashboard } = dashboard.actions;

export const { updateReplay, updateReplayInfo, resetReplay } = replay.actions;
export const { updateMessages, resetMessages } = messages.actions;
export default combined;
