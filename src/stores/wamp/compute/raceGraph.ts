/**
 * contains computations for raceGraph
 */

import { IRaceGraph, IWampData } from "../types";
import { getValueViaSpec } from "./util";

interface IColData {
  value: number | [number, string];
}
export const processForRaceGraph = (current: IWampData, newData: [][]): IRaceGraph[] => {
  const leaderEntry = newData.find((dataRow) => getValueViaSpec(dataRow, current.manifests.car, "pos") === 1);
  if (leaderEntry == undefined) return current.raceGraph;

  const leaderLap = getValueViaSpec(leaderEntry, current.manifests.car, "lc");
  const x = current.raceGraph.find((v) => v.lapNo == leaderLap);
  const newLapEntry: IRaceGraph = {
    lapNo: getValueViaSpec(leaderEntry, current.manifests.car, "lc"),
    gaps: newData.map((carEntry) => ({
      gap: getValueViaSpec(carEntry, current.manifests.car, "gap"),
      lapNo: getValueViaSpec(carEntry, current.manifests.car, "lc"),
      carNum: getValueViaSpec(carEntry, current.manifests.car, "carNum"),
    })),
  };
  if (x === undefined) {
    return [...current.raceGraph, newLapEntry];
  } else {
    return [...current.raceGraph.slice(0, -1), newLapEntry];
  }
};
