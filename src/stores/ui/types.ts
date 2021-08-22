import { ICarBaseData } from "../racedata/types";

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
export interface IDriverLapsSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  filterSecs: number;
  brushInterval?: IBrushInterval;
}
export interface IRaceGraphRelativeSettings {
  referenceCarNum?: string;
  showCars: string[]; // the cars to show
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  deltaRange: number; // used in both direction (positive and negativ to reference)
  brushInterval?: IBrushInterval;
}
export interface IRaceGraphSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  gapRelativeToClassLeader: boolean; // if true, compute gap relative to class leader
  deltaRange: number; // used in both direction (positive and negativ to reference)
  brushInterval?: IBrushInterval;
}
export interface IRacePositionsSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  showPosInClass: boolean; // if true, show position in class
  brushInterval?: IBrushInterval;
}
export interface IPitstopsSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  hideLongPitstops: boolean; // if true, long pitstop will hide the car row
  hideThreshold: number; // threshold (in sec) to hide a car row
  showRunningOnly: boolean; // if true, show only cars that are still running (TBD if this will be used)
}
export interface IStintsSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  showAsLabel: string;
  showRunningOnly: boolean; // if true, show only cars that are still running (TBD if this will be used)
}

export interface IStintSummarySettings {
  carNum?: string;
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  deltaRange: number; // used in both direction (positive and negativ to reference)
}
export interface IDashboardSettings {
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  referenceCarNum?: string; // used for delta
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
export interface ICircleOfDoomSettings {
  referenceCarNum: string; // use this car for calculations
  pitstopTime: number; // calculate with this pit stop time
  calcSpeed: number; // for temporary use during development
  showCars: string[];
  selectableCars: ICarBaseData[]; // the cars to show in the dropdown as selectable
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
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

export interface IGlobalSettings {
  syncSelection: boolean; // if true, selection for showCars,referenceCars are pushed to all relevant pages
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  referenceCarNum?: string; // used for graphs where a reference is needed
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
  dashboard: IDashboardSettings;
  driverStints: IDriverStintsSettings;
  circleOfDoom: ICircleOfDoomSettings;
  replay: IReplaySettings;
  global: IGlobalSettings;
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
    },
  },
  raceGraphRelativeSettings: {
    standard: {
      selectableCars: [],
      referenceCarNum: "",
      showCars: [],
      filterCarClasses: [],
      deltaRange: 10,
    },
  },
  raceGraphSettings: {
    standard: {
      showCars: [],
      selectableCars: [],
      filterCarClasses: [],
      deltaRange: 120,
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
