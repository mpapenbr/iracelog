export interface IRaceEvent {
  id: string;
  name: string;
  trackNameShort: string;
  trackNameLong: string;
  lastModified: Date;
}

const defaultRaceEvent: IRaceEvent = {
  id: "",
  name: "",
  trackNameShort: "",
  trackNameLong: "",
  lastModified: new Date(),
};

export interface IRaceContainer {
  eventData: IRaceEvent;
  summary: IEventSummary;
}

export interface IRaceLogData {
  carIdxPosition: number[];
  carIdxClassPosition: number[];
  carIdxLapDistPct: number[];
  carIdxLastLapTime: number[];
  carIdxLap: number[];
  carIdxLapCompleted: number[];
  carIdxOnPitRoad: boolean[];

  sessionTick: number;
  sessionTime: number;
  sessionTimeRemain: number;
  sessionNum: number;
  sessionFlags: number;
  sessionState: number;
}

export interface IRaceLogMeta {
  sessionTick: number;
  sessionTime: number;
  sessionNum: number;
  data: IRaceLogData;
}

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
  eventData: defaultRaceEvent,
  summary: defaultEventSummary,
};
export interface IRaceEventsState {
  readonly data: IRaceEvent[];
  readonly current: IRaceContainer;
}

const defaultRaceLogData = (): IRaceLogData => ({
  carIdxPosition: [],
  carIdxClassPosition: [],
  carIdxLapDistPct: [],
  carIdxLastLapTime: [],
  carIdxLap: [],
  carIdxLapCompleted: [],
  carIdxOnPitRoad: [],

  sessionTick: 0,
  sessionTime: 0,
  sessionTimeRemain: 0,
  sessionNum: 0,
  sessionFlags: 0,
  sessionState: 0,
});

export const defaultRaceLogMeta: IRaceLogMeta = {
  sessionNum: 0,
  sessionTick: 0,
  sessionTime: 0,
  data: defaultRaceLogData(),
};
