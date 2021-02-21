export interface IWamp {
  stintNo: number;
}

interface IMessage {
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

export interface IPitInfo {
  carNum: string;
  enterTime: number;
  exitTime: number;
  lapEnter: number;
  lapExit: number;
  stintTime: number;
  laneTime: number;
}

export const defaultPitInfo: IPitInfo = {
  carNum: "",
  enterTime: 0,
  exitTime: 0,
  lapEnter: 0,
  lapExit: 0,
  stintTime: 0,
  laneTime: 0,
};
export interface ICarPitInfo {
  carNum: string;
  current: IPitInfo;
  history: IPitInfo[];
}

export interface IWampData {
  connected: boolean;
  session: IMessage;
  infoMsgs: IMessage[];
  cars: IMessage;
  carPits: ICarPitInfo[];
  dummy: any;
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
  dummy: "no content yet",
};
export interface IWampState {
  readonly data: IWampData;
}
