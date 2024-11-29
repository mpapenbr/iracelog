import { CarLaps, Lap } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_laps_pb";
import { StintInfo } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_stint_pb";

export const quantile = (sorted: number[], q: number) => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export const statsDataFor = (data: number[]) => {
  const sorted = data.sort((a, b) => a - b);
  return {
    minTime: sorted[0],
    maxTime: sorted[sorted.length - 1],
    q25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q75: quantile(sorted, 0.75),
    q95: quantile(sorted, 0.95),
    q99: quantile(sorted, 0.99),
  };
};

export interface IBoxPlotData {
  minTime: number;
  maxTime: number;
  median: number;
  q25: number;
  q75: number;
  q95: number;
  q99: number;
}
export interface IBoxPlotDataExtended extends IBoxPlotData {
  iqr: number;
  lowerFence: number;
  upperFence: number;
  realLowerFence: number;
  realUpperFence: number;
  outliers: number[];
}

/**
 * additional to data provided by statsDataFor
 * - lowerFence: computed box plot fence via q1 - IQR*1.5
 * - upperFence: computed box plot fence via q3 + IQR*1.5
 * - realUpperFence: the actual last value which is <= upperFence
 * - realLowerFence: the actual first value which is >= lowerFence
 * - outliers: everthing not between lowerFence and upperFence
 *
 * @param laptimes
 * @returns see above
 *
 */
export const boxPlotDataFor = (laptimes: number[]): IBoxPlotDataExtended => {
  const stats = statsDataFor(laptimes);
  const iqr = stats.q75 - stats.q25;
  const lowerFence = stats.q25 - iqr * 1.5;
  const upperFence = stats.q75 + iqr * 1.5;
  const realLowerFence = laptimes.find((v) => v > lowerFence) ?? lowerFence;
  const realUpperFence = [...laptimes].reverse().find((v) => v < upperFence) ?? upperFence;
  const outliers = laptimes.filter((v) => v < lowerFence || v > upperFence);
  // console.log(`${iqr} -  ${iqr * 1.5}`);
  // console.log(outliers);
  // console.log(`lowerFence: ${lowerFence} realLowerFence: ${realLowerFence} `);
  // console.log(`upperFence: ${upperFence} realUpperFence: ${realUpperFence} `);
  return {
    ...stats,
    iqr,
    lowerFence,
    upperFence,
    realLowerFence,
    realUpperFence,
    outliers,
  };
};

export const stintLaps = (si: StintInfo, laptimes: CarLaps): Lap[] => {
  // exclude in and outlap from calculation
  const laps =
    laptimes?.laps?.filter((v) => v.lapNo >= si.lapExit && v.lapNo <= si.lapEnter).slice(1, -1) ??
    [];
  return laps;
};
// this method includes the in/out laps
export const stintLapsRaw = (si: StintInfo, laptimes: CarLaps): Lap[] => {
  const laps = laptimes?.laps?.filter((v) => v.lapNo >= si.lapExit && v.lapNo <= si.lapEnter) ?? [];
  return laps;
};
