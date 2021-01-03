export interface IPitstopMeta {
  sessionTime: number;
  sessionNum: number;
  sessionTick: number;
  data: IPitstop;
}
export interface IPitstop {
  carIdx: number;
  pitLaneTime: number;
  pitStopTime: number;
  laneEnterTime: number;
  stopEnterTime: number;
}

const defaultPitstop: IPitstop = {
  carIdx: 0,
  pitLaneTime: 0,
  pitStopTime: 0,
  laneEnterTime: 0,
  stopEnterTime: 0,
};

const defaultPitstopMeta: IPitstopMeta = {
  sessionTime: 0,
  sessionNum: 0,
  sessionTick: 0,
  data: defaultPitstop,
};
