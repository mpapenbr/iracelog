export interface ILaptimeMeta {
  sessionTime: number;
  sessionNum: number;
  sessionTick: number;
  data: ILaptime;
}
export interface ILaptime {
  carIdx: number;
  lapNo: number;
  lapTime: number;
  sectors: number[];
  inLap: boolean;
  outLap: boolean;
  incomplete: boolean;
}

const defaultLaptime: ILaptime = {
  carIdx: 0,
  lapNo: 0,
  lapTime: 0,
  sectors: [],
  inLap: false,
  outLap: false,
  incomplete: false,
};

const defaultLaptimeMeta: ILaptimeMeta = {
  sessionTime: 0,
  sessionNum: 0,
  sessionTick: 0,
  data: defaultLaptime,
};
