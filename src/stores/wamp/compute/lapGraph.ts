/**
 * contains computations for raceGraph
 */

import { ICarLaps, IWampData } from "../types";
import { getValueViaSpec } from "./util";

interface IColData {
  value: number | [number, string];
}
export const processForLapGraph = (current: IWampData, newData: [][]): ICarLaps[] => {
  let newCarLaps = [] as ICarLaps[];
  newData.forEach((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");
    const currentCarLap = getValueViaSpec(carEntry, current.manifests.car, "lc");
    const currentCarLapTime = getValueViaSpec(carEntry, current.manifests.car, "last");
    if (currentCarLap < 1) return;
    let found = current.carLaps.find((v) => v.carNum === currentCarNum);
    if (found === undefined) {
      found = { carNum: currentCarNum, laps: [] };
    }
    let foundLap = found.laps.find((v) => v.lapNo === currentCarLap);
    if (foundLap === undefined) {
      found.laps = [...found.laps, { lapNo: currentCarLap, lapTime: currentCarLapTime }];
    } else {
      found.laps = [...found.laps.slice(0, -1), { lapNo: currentCarLap, lapTime: currentCarLapTime }];
    }
    newCarLaps.push(found);
  });
  return newCarLaps;
};
