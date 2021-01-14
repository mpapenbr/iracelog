import { ILaptimeExtended } from "./laptimes";

export interface IMinMaxAvg {
  count: number;
  min: number;
  max: number;
  avg: number;
}

export interface IStintData {
  stintNo: number;
  all: IMinMaxAvg;
  ranged: IMinMaxAvg;
  laps: ILaptimeExtended[];
}
