export interface ICarBaseData {
  carNum: string;
  name: string;
  carClass: string;
}

export interface ICarClass {
  name: string;
}

export interface ISector {
  SectorNum: number;
  SectorStartPct: number;
}
export interface IEventInfo {
  name: string;
  trackId: number;
  teamRacing: boolean;
  irSessionId: number;
  trackDisplayName: string;
  trackDisplayShortName: string;
  trackConfigName: string;
  trackLength: number;
  eventTime: string;
  sectors: ISector[];
  raceLoggerVersion: string;
  multiClass: boolean;
  numCarClasses: number;
  numCarTypes: number;
}

export interface IPitInfo {
  entry: number;
  exit: number;
  pitDelta: number;
}
export interface ITrackInfo {
  pit: IPitInfo;
  sectors: ISector[];
  trackId: number;
  trackDisplayName: string;
  trackDisplayShortName: string;
  trackConfigName: string;
  trackLength: number;
}

export interface IReplayMessage {
  type: number;
  timestamp: number;
  payload: any;
}
export interface ISpeedmapMessage {
  type: number;
  timestamp: number;
  payload: any;
}
