import { IDriverMeta } from "../drivers/types";
import { ICarStintData } from "../types/stints";

export interface IRaceSession {
  num: number;
  name: string;
  type: string;
}
export interface IRaceEvent {
  id: string;
  name: string;
  trackNameShort: string;
  trackNameLong: string;
  trackLength: number;
  trackConfig: string;
  trackId: number;
  trackDynamicTrack: number;
  teamRacing: number;
  numCarClasses: number;
  numCarTypes: number;

  lastModified: Date;
  eventStart: Date;
  sessions: IRaceSession[];
}

const defaultRaceEvent: IRaceEvent = {
  id: "",
  name: "",
  trackNameShort: "",
  trackNameLong: "",
  trackConfig: "",
  trackLength: 0,
  trackDynamicTrack: 0,
  trackId: 0,
  teamRacing: 0,
  numCarClasses: 0,
  numCarTypes: 0,
  lastModified: new Date(),
  eventStart: new Date(),
  sessions: [],
};

export interface IRaceContainer {
  id: string;
  eventLoaded: boolean;
  carStintsLoaded: boolean;
  eventData: IRaceEvent;
  summary: IEventSummary;
  drivers: IDriverMeta[];
  carStints: ICarStintData[];
}

export interface IRaceLogData {
  carIdxPosition: number[];
  carIdxClassPosition: number[];
  carIdxLapDistPct: number[];
  carIdxLastLapTime: number[];
  carIdxLap: number[];
  carIdxLapCompleted: number[];
  carIdxLapSectors: number[][];
  carIdxOnPitRoad: boolean[];
  carIdxSpeed: number[];
  carIdxDelta: number[];
  carIdxDistMeters: number[];

  sessionTick: number;
  sessionTime: number;
  sessionTimeRemain: number;
  sessionTimeOfDay: number;
  sessionNum: number;
  sessionFlags: number;
  sessionState: number;

  airDensity: number;
  airPressure: number;
  airTemp: number;
  trackTemp: number;
  trackTempCrew: number;
}

const defaultRaceLogData = (): IRaceLogData => ({
  carIdxPosition: [],
  carIdxClassPosition: [],
  carIdxLapDistPct: [],
  carIdxLastLapTime: [],
  carIdxLap: [],
  carIdxLapCompleted: [],
  carIdxLapSectors: [],
  carIdxOnPitRoad: [],
  carIdxSpeed: [],
  carIdxDelta: [],
  carIdxDistMeters: [],

  sessionTick: 0,
  sessionTime: 0,
  sessionTimeRemain: 0,
  sessionTimeOfDay: 0,
  sessionNum: 0,
  sessionFlags: 0,
  sessionState: 0,

  airDensity: 0,
  airPressure: 0,
  airTemp: 0,
  trackTemp: 0,
  trackTempCrew: 0,
});

export interface IRaceLogMeta {
  sessionTick: number;
  sessionTime: number;
  sessionNum: number;
  data: IRaceLogData;
}

export const defaultRaceLogMeta: IRaceLogMeta = {
  sessionNum: 0,
  sessionTick: 0,
  sessionTime: 0,
  data: defaultRaceLogData(),
};

export interface ISessionSummary {
  sessionNum: number;
  minTime: number;
  maxTime: number;
  minTick: number;
  maxTick: number;
  count: number;
}
export interface IEventSummary {
  sessionSummaries: ISessionSummary[];
}

const defaultEventSummary: IEventSummary = {
  sessionSummaries: [],
};
export const defaultRaceContainer: IRaceContainer = {
  id: "",
  eventLoaded: false,
  carStintsLoaded: false,
  eventData: defaultRaceEvent,
  summary: defaultEventSummary,
  drivers: [],
  carStints: [],
};
export interface IRaceEventsState {
  /**
   * contains the races shown in the overview
   */
  readonly data: IRaceEvent[];
  /**
   * contains information about the current race
   */
  readonly current: IRaceContainer;
}
