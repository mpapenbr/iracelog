export interface IUiStints {
  stintNo: number;
}
export interface IUiEntries {
  entryDetails: number;
}
export interface IDriverLapsSettings {
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  filterSecs: number;
}
export interface IRaceGraphRelativeSettings {
  referenceCarNum: string;
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  deltaRange: number; // used in both direction (positive and negativ to reference)
}
export interface IRaceGraphSettings {
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  gapRelativeToClassLeader: boolean; // if true, compute gap relative to class leader
}
export interface IRacePositionSettings {
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
  showPosInClass: boolean; // if true, show position in class
}
export interface IRaceStintSharedSettings {
  showCars: string[];
  filterCarClasses: string[]; // empty = all classes, otherwise only selected
}
export interface IUiData {
  stint: IUiStints;
  entries: IUiEntries;

  // "new" ui comps
  driverLapsSettings: IDriverLapsSettings;
  raceGraphRelativeSettings: IRaceGraphRelativeSettings;
  raceGraphSettings: IRaceGraphSettings;
  racePositionSettings: IRacePositionSettings;
  raceStintSharedSettings: IRaceStintSharedSettings;
}

export const defaultUiData: IUiData = {
  stint: { stintNo: 0 },
  entries: { entryDetails: -1 },

  // "new" ui comps
  driverLapsSettings: {
    showCars: [],
    filterCarClasses: [],
    filterSecs: 2,
  },
  raceGraphRelativeSettings: {
    referenceCarNum: "",
    showCars: [],
    filterCarClasses: [],
    deltaRange: 10,
  },
  raceGraphSettings: {
    showCars: [],
    filterCarClasses: [],
    gapRelativeToClassLeader: false,
  },
  racePositionSettings: {
    showCars: [],
    filterCarClasses: [],
    showPosInClass: false,
  },
  raceStintSharedSettings: {
    showCars: [],
    filterCarClasses: [],
  },
};
export interface IUiState {
  readonly data: IUiData;
}
