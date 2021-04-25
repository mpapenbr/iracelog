import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";

export interface IWamp {
  stintNo: number;
}

export interface IMessage {
  msgType: number;
  timestamp: number;
  data: any;
}

export interface IDataEntrySpec {
  name: string;
  type: string;
  info?: string;
}

/**
 * variable data during sesssion
 */
export const SessionManifest: IDataEntrySpec[] = [
  { name: "sessionTime", type: "duration", info: "Current session time" },
  { name: "timeRemain", type: "duration", info: "Session time remaining" },
  { name: "lapsRemain", type: "numeric", info: "Remaining laps in race" },
  { name: "flagState", type: "text", info: "" },
  { name: "timeOfDay", type: "duration", info: "Current time in race" },
  { name: "airTemp", type: "numeric", info: "Air temperature" },
  { name: "airDensity", type: "numeric", info: "Air density" },
  { name: "airPressure", type: "numeric", info: "Air pressure" },
  { name: "trackTemp", type: "numeric", info: "Track temperature" },
  { name: "windDir", type: "numeric", info: "Wind direction" },
  { name: "windVel", type: "numeric", info: "Wind velocity" },
];

export const InfoMsgManifest: IDataEntrySpec[] = [
  { name: "type", type: "string", info: "Describes source of message" },
  { name: "subType", type: "string", info: "Additional type for message" },
  { name: "carIdx", type: "numeric", info: "iRacing carIdx" },
  { name: "carNum", type: "string", info: "car number" },
  { name: "carClass", type: "string", info: "car class" },
  { name: "msg", type: "string", info: "The message" },
];

export const CarManifest: IDataEntrySpec[] = [
  { name: "state", type: "string", info: "General info about the car (running,pit,...)" },
  { name: "carIdx", type: "numeric", info: "iRacing carIdx" },
  { name: "carNum", type: "string", info: "car number" },
  { name: "userName", type: "string", info: "current driver" },
  { name: "teamName", type: "string", info: "team name (if available)" },
  { name: "carClass", type: "string", info: "car class" },
  { name: "pos", type: "numeric", info: "overall position" },
  { name: "pic", type: "numeric", info: "position in class" },
  { name: "lap", type: "numeric", info: "current lap" },
  { name: "lc", type: "numeric", info: "laps completed" },
  { name: "gap", type: "numeric", info: "gap to leader" },
  { name: "interval", type: "numeric", info: "interval to car in front" },
  { name: "trackPos", type: "numeric", info: "position on track (percent)" },
  { name: "speed", type: "numeric", info: "current speed" },
  { name: "dist", type: "numeric", info: "distance to car in front (m)" },
  { name: "pit", type: "numeric", info: "# pitstops" },
  { name: "last", type: "numeric", info: "last lap time" },
  { name: "best", type: "numeric", info: "best lap time" },
];

// ['carNum', 'type', 'enterTime', 'exitTime', 'laneTime', 'stintTime', 'lapEnter', 'lapExit']

export const PitManifest: IDataEntrySpec[] = [
  { name: "carNum", type: "string", info: "car number" },
  { name: "type", type: "string", info: "enter/exit" },
  { name: "enterTime", type: "string", info: "session time when entering pit" },
  { name: "exitTime", type: "string", info: "session time when exiting pit" },
  { name: "laneTime", type: "duration", info: "time spend in pit lane" },
  { name: "stintTime", type: "duration", info: "time spend after leaving pit" },
  { name: "lapEnter", type: "numeric", info: "lap when entering pit" },
  { name: "lapExit", type: "numeric", info: "lap when exiting pit" },
];

export interface IManifests {
  car: IDataEntrySpec[];
  session: IDataEntrySpec[];
  pit: IDataEntrySpec[];
  message: IDataEntrySpec[];
}

const defaultManifests: IManifests = {
  car: CarManifest,
  session: SessionManifest,
  pit: SessionManifest,
  message: InfoMsgManifest,
};

export interface IPitInfo {
  carNum: string;
  enterTime: number;
  exitTime: number;
  lapEnter: number;
  lapExit: number;
  stintTime: number;
  laneTime: number;
  numLaps: number;
  isCurrentPitstop: boolean; // true if this is the current stint
}

export const defaultPitInfo: IPitInfo = {
  carNum: "",
  enterTime: 0,
  exitTime: 0,
  lapEnter: 0,
  lapExit: 0,
  stintTime: 0,
  laneTime: 0,
  numLaps: 0,
  isCurrentPitstop: false,
};
export interface ICarPitInfo {
  carNum: string;
  current: IPitInfo;
  history: IPitInfo[];
}
export interface IStintInfo {
  carNum: string;
  enterTime: number;
  exitTime: number;
  lapEnter: number;
  lapExit: number;
  stintTime: number;
  numLaps: number;
  isCurrentStint: boolean; // true if this is the current stint
}

export const defaultStintInfo: IStintInfo = {
  carNum: "",
  enterTime: 0,
  exitTime: 0,
  lapEnter: 0,
  lapExit: 0,
  stintTime: 0,
  numLaps: 0,
  isCurrentStint: false,
};
export interface ICarPitInfo {
  carNum: string;
  current: IPitInfo;
  history: IPitInfo[];
}
export interface ICarStintInfo {
  carNum: string;
  current: IStintInfo;
  history: IStintInfo[];
}

export interface IGapInfo {
  carNum: string;
  lapNo: number;
  gap: number;
  pos: number;
  pic: number;
}

export interface IRaceGraph {
  lapNo: number;
  carClass: string; // "overall", or car class name provided by incoming
  gaps: IGapInfo[];
}

export interface ILapInfo {
  lapNo: number;
  lapTime: number;
}
export interface ICarLaps {
  carNum: string;
  laps: ILapInfo[];
}

export interface ISeatTime {
  enterCarTime: number;
  leaveCarTime: number;
}
export interface IDriverInfo {
  driverName: string;
  seatTime: ISeatTime[];
}

export interface ICarInfo {
  carNum: string;
  name: string;
  carClass: string;
  drivers: IDriverInfo[];
  current: IDriverInfo;
}

export enum CarComputeState {
  INIT,
  RUN,
  PIT,
  OUT,
}
export interface ICarComputeState {
  carNum: string;
  state: CarComputeState;
}
export interface IWampData extends IProcessRaceStateData {
  connected: boolean;
  manifests: IManifests;
}
export const emptyMessage: IMessage = {
  msgType: 0,
  timestamp: 0,
  data: [],
};
export const defaultWampData: IWampData = {
  connected: false,

  session: emptyMessage,
  cars: emptyMessage,
  infoMsgs: [],
  carPits: [],
  carStints: [],
  manifests: defaultManifests,
  raceGraph: [],
  carLaps: [],
  carInfo: [],
  carComputeState: [],
  raceOrder: [],
};
export interface IWampState {
  readonly data: IWampData;
}
