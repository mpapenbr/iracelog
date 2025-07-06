import { LaptimeSelector } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_service_pb";
import { ICarBaseData } from "./availableCarsSlice";

export interface IUiStints {
  stintNo: number;
}
export interface IUiEntries {
  entryDetails: number;
}

export enum UiComponent {
  DRIVER_LAPS,
  RACE_GRAPH_LEADER,
  RACE_GRAPH_CAR,
}
export interface IBrushInterval {
  startIndex?: number;
  endIndex?: number;
}

export interface IColumnInfo {
  name: string;
  title: string;
}

export interface IClassificationSettings {
  pageSize: number;
  showCols: IColumnInfo[];
}
export interface IMessagesSettings {
  pageSize: number;
}

export interface ICommonFilterSettings {
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
}
export interface ISingleCarSelectFilterSettings extends ICommonFilterSettings {
  referenceCarNum?: string; // the actual selected car number
}
export interface IMultiCarSelectFilterSettings extends ICommonFilterSettings {
  showCars: string[]; // the actual cars to show (contains car numbers)
}
export interface IReferenceCarSelectFilterSettings
  extends ISingleCarSelectFilterSettings,
    IMultiCarSelectFilterSettings {
  // no extra fields
}

export interface IDriverLapsSettings extends IMultiCarSelectFilterSettings {
  filterSecs: number;
  brushInterval?: IBrushInterval;
  limitLastLaps: number; // if > 0 show only last X laps in driverLaps (live mode)
}
export interface IRaceGraphRelativeSettings extends IReferenceCarSelectFilterSettings {
  deltaRange: number; // used in both direction (positive and negativ to reference)
  brushInterval?: IBrushInterval;
  limitLastLaps: number; // if > 0 consider only last X laps (live mode)
}
export interface IRaceGraphSettings extends IMultiCarSelectFilterSettings {
  gapRelativeToClassLeader: boolean; // if true, compute gap relative to class leader
  deltaRange: number; // used in both direction (positive and negativ to reference)
  brushInterval?: IBrushInterval;
  limitLastLaps: number; // if > 0 consider only last X laps (live mode)
}
export interface IRacePositionsSettings extends IMultiCarSelectFilterSettings {
  showPosInClass: boolean; // if true, show position in class
  brushInterval?: IBrushInterval;
}
export interface IPitstopsSettings extends IMultiCarSelectFilterSettings {
  hideLongPitstops: boolean; // if true, long pitstop will hide the car row
  hideThreshold: number; // threshold (in sec) to hide a car row
  showRunningOnly: boolean; // if true, show only cars that are still running (TBD if this will be used)
}
export interface IStintsSettings extends IMultiCarSelectFilterSettings {
  showAsLabel: string;
  showRunningOnly: boolean; // if true, show only cars that are still running (TBD if this will be used)
}

export interface IStintSummarySettings extends ISingleCarSelectFilterSettings {
  deltaRange: number; // used in both direction (positive and negativ to reference)
}
export interface IDashboardSettings extends IReferenceCarSelectFilterSettings {
  deltaRange: number; // show only delta sec within this range
  limitLastLaps: number; // if > 0 show only last X laps in driverLaps (live mode)
}
export interface IStrategySettings extends IMultiCarSelectFilterSettings {}
export interface IStintRankingSettings extends IMultiCarSelectFilterSettings {
  minSessionTime: number; // minimum session time of event
  maxSessionTime: number; // maximum session time of event
  lowerRangeTime: number; // left side of selected time range
  upperRangeTime: number; // right side of selected time range
}
export interface IPredictRaceSettings extends IMultiCarSelectFilterSettings {
  minSessionTime: number; // minimum session time of event
  maxSessionTime: number; // maximum session time of event
  selectTime: number; // the value of the slider
  lowerRangeTime: number; // left side of selected time range
  upperRangeTime: number; // right side of selected time range
  laptimeSelector: LaptimeSelector; //
}

export interface IRaceStintSharedSettings {
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  showAsLabel: string;
  brushInterval?: IBrushInterval;
}
export interface IDriverStintsSettings {
  carNum: string;
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  filterSecs: number;
  filterInOut: boolean;
  showStint: number; // 0: all
}
export interface ICircleOfDoomSettings extends IReferenceCarSelectFilterSettings {
  pitstopTime: number; // calculate with this pit stop time
  calcSpeed: number; // for temporary use during development
}
export interface IReplaySettings {
  enabled: boolean;
  playing: boolean;
  playSpeed: number;
  timerHandle: number;
  eventKey: string; // the event key currently loaded for replay (blank if none)
  eventId: number; // the (internal) event id associated to the eventKey
  minTimestamp: number; // the timestamp (number) of the first "race" entry in the db
  minSessionTime: number;
  maxSessionTime: number;
  currentSessionTime: number;
  currentTimestamp: number; // holds the current timestamp
}
export type TimeMode = "session" | "sim" | "real";
export interface IPersistedSettings {
  syncSelection: boolean; // if true, selection for showCars,referenceCars are pushed to all relevant pages
  filterOrderByPosition: boolean; // if true, cars in selections will be ordered by race position
  theme: string;
  useCompact: boolean;
  timeMode: TimeMode;
  useInOutTimes: boolean; // if true use in/outlap time instead of "offical" lap time
}
export interface IGlobalSettings extends IPersistedSettings {
  showCars: string[];
  highlightCars: string[]; // cars to highlight in various places
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  referenceCarNum?: string; // used for graphs where a reference is needed
}
export interface IRaceloggerSettings {
  url: string; // the url of the racelogger server
}
export interface IRaceloggerStatus {
  raceloggerServerAvailable: boolean; // true if the racelogger server is available
  simulationRunning: boolean; // true if the simulation is running
  telemetryAvailable: boolean; // true if sim data is available
  recording: boolean; // true if recording is active
  backendAvailable: boolean; // true if the backend is available
  backendCompatible: boolean; // true if the backend is compatible with racelogger
  validCredentials: boolean; // true if the credentials are valid
  backendVersion: string; // the version of the backend
  currentSessionNum: number; // the current session number
  raceSessions: { num: number; name: string }[]; // list of race sessions
}
export interface IUiData {
  stint: IUiStints;
  entries: IUiEntries;

  // "new" ui comps
  classificationSettings: IClassificationSettings;
  messagesSettings: IMessagesSettings;

  driverLapsSettings: {
    standard: IDriverLapsSettings;
    brushRange?: IBrushInterval; // has to be seperated from the other settings due to different update mechanism
  };
  raceGraphRelativeSettings: {
    standard: IRaceGraphRelativeSettings;
    brushRange?: IBrushInterval; // see above
  };
  raceGraphSettings: {
    standard: IRaceGraphSettings;
    brushRange?: IBrushInterval; // see above
  };
  racePositionSettings: IRacePositionsSettings;
  raceStintSharedSettings: IRaceStintSharedSettings;
  driverStintSettings: IDriverStintsSettings;
}
// this is computed on first hit of the standings page. It contains all columns which may be displayed.
// the selection which columns are shown is stored in classification
export interface IStandingsColumns {
  availableColumns: IColumnInfo[];
}

export interface IUserSettings {
  classification: IClassificationSettings;
  messages: IMessagesSettings;
  raceGraph: IRaceGraphSettings;
  raceGraphRelative: IRaceGraphRelativeSettings;
  racePositions: IRacePositionsSettings;
  driverLaps: IDriverLapsSettings;
  pitstops: IPitstopsSettings;
  stints: IStintsSettings;
  stintSummary: IStintSummarySettings;
  stintRanking: IStintRankingSettings;
  predict: IPredictRaceSettings;

  dashboard: IDashboardSettings;
  strategy: IStrategySettings;
  driverStints: IDriverStintsSettings;
  circleOfDoom: ICircleOfDoomSettings;
  replay: IReplaySettings;
  global: IGlobalSettings;
  standingsColumns: IStandingsColumns;
  counter: number;
}

// may be deleted - check usage!
export const defaultUiData: IUiData = {
  stint: { stintNo: 0 },
  entries: { entryDetails: -1 },

  // "new" ui comps
  classificationSettings: {
    pageSize: 20,
    showCols: [],
  },
  messagesSettings: {
    pageSize: 20,
  },

  driverLapsSettings: {
    standard: {
      showCars: [],
      selectableCars: [],
      filterCarClasses: [],
      filterSecs: 2,
      limitLastLaps: 30,
    },
  },
  raceGraphRelativeSettings: {
    standard: {
      selectableCars: [],
      referenceCarNum: "",
      showCars: [],
      filterCarClasses: [],
      deltaRange: 10,
      limitLastLaps: 30,
    },
  },
  raceGraphSettings: {
    standard: {
      showCars: [],
      selectableCars: [],
      filterCarClasses: [],
      deltaRange: 120,
      limitLastLaps: 30,
      gapRelativeToClassLeader: false,
    },
  },
  racePositionSettings: {
    showCars: [],
    selectableCars: [],
    filterCarClasses: [],
    showPosInClass: false,
  },
  driverStintSettings: {
    carNum: "",
    filterCarClasses: [],
    selectableCars: [],
    filterSecs: 2,
    filterInOut: true,
    showStint: 0,
  },
  raceStintSharedSettings: {
    showCars: [],
    filterCarClasses: [],
    showAsLabel: "duration",
  },
};
export interface IUiState {
  readonly data: IUiData;
}
