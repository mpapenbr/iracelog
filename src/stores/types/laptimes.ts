export interface ILaptimeMeta {
  sessionTime: number;
  sessionNum: number;
  sessionTick: number;
  data: ILaptime;
}
export interface ILaptime {
  carIdx: number;
  lapTime: number;
  sectors: number[];
}

const defaultLaptime: ILaptime = {
  carIdx: 0,
  lapTime: 0,
  sectors: [],
};

const defaultLaptimeMeta: ILaptimeMeta = {
  sessionTime: 0,
  sessionNum: 0,
  sessionTick: 0,
  data: defaultLaptime,
};
