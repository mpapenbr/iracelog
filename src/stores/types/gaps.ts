export interface ICarInfo {
  carIdx: number;
  position: number;
  classPosition: number;
  rawDelta: number;
}

export interface IGap {
  lapNo: number;
  delta: number;
  ref: ICarInfo;
  other: ICarInfo;
}
