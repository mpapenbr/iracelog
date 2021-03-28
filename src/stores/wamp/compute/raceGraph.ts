/**
 * contains computations for raceGraph
 */

import _ from "lodash";
import { ICarInfo, IRaceGraph, IWampData } from "../types";
import { getValueViaSpec } from "./util";

export const processForRaceGraph = (current: IWampData, newData: [][]): IRaceGraph[] => {
  const leaderEntry = newData.find((dataRow) => getValueViaSpec(dataRow, current.manifests.car, "pos") === 1);
  if (leaderEntry === undefined) return current.raceGraph;
  let work = [...current.raceGraph];
  const picLookup = computePicLookup(current, newData);
  work = processForRaceGraphForOverall(current, newData, work, picLookup);
  work = processForRaceGraphForClass(current, newData, work, picLookup);
  return work;
};

/**
 * a class position may be 0 (didn't check but this may be related to certain pitstop situations)
 */
const computePicLookup = (current: IWampData, newData: [][]) => {
  const belongsToCarClass = (dataRow: [], carClass: string): boolean => {
    return (getValueViaSpec(dataRow, current.manifests.car, "carClass") as string).localeCompare(carClass) === 0;
  };
  let picLookup = new Map<string, number>();
  const carClasses = computeCarClasses(current.carInfo);
  if (carClasses.length > 0) {
    carClasses.forEach((curCarClass) => {
      const classResorted = newData
        .filter((dataRow) => belongsToCarClass(dataRow, curCarClass))
        .map((dataRow) => {
          const pic = getValueViaSpec(dataRow, current.manifests.car, "pic");
          const carNum = getValueViaSpec(dataRow, current.manifests.car, "carNum");
          return { carNum: carNum, pic: pic };
        })
        .sort((a, b) => a.pic - b.pic);
      classResorted.forEach((v, idx) => {
        picLookup.set(v.carNum, idx + 1);
      });
    });
  } else {
    const resorted = newData
      .map((dataRow) => {
        const pic = getValueViaSpec(dataRow, current.manifests.car, "pic");
        const carNum = getValueViaSpec(dataRow, current.manifests.car, "carNum");
        return { carNum: carNum, pic: pic };
      })
      .sort((a, b) => a.pic - b.pic);
    resorted.forEach((v, idx) => {
      picLookup.set(v.carNum, idx + 1);
    });
  }

  return picLookup;
};

export const processForRaceGraphForOverall = (
  current: IWampData,
  newData: [][],
  currentRaceGraph: IRaceGraph[],
  picLookup: Map<string, number>
): IRaceGraph[] => {
  const leaderEntry = newData.find((dataRow) => getValueViaSpec(dataRow, current.manifests.car, "pos") === 1);
  if (leaderEntry === undefined) return currentRaceGraph;

  const leaderLap = getValueViaSpec(leaderEntry, current.manifests.car, "lc");
  const foundIdx = currentRaceGraph.findIndex((v) => v.lapNo === leaderLap);
  const newLapEntry: IRaceGraph = {
    carClass: "overall",
    lapNo: getValueViaSpec(leaderEntry, current.manifests.car, "lc"),
    gaps: newData.map((carEntry) => ({
      gap: getValueViaSpec(carEntry, current.manifests.car, "gap"),
      lapNo: getValueViaSpec(carEntry, current.manifests.car, "lc"),
      carNum: getValueViaSpec(carEntry, current.manifests.car, "carNum"),
      pos: getValueViaSpec(carEntry, current.manifests.car, "pos"),
      pic: picLookup.get(getValueViaSpec(carEntry, current.manifests.car, "carNum"))!,
    })),
  };
  if (foundIdx === -1) {
    return [...currentRaceGraph, newLapEntry];
  } else {
    currentRaceGraph.splice(foundIdx, 1, newLapEntry);
    return [...currentRaceGraph];
    // return [...currentRaceGraph.slice(0, -1), newLapEntry];
  }
};

const computeCarClasses = (carInfos: ICarInfo[]) => {
  return _.uniq(carInfos.filter((v) => "".localeCompare(v.carClass || "") !== 0).map((v) => v.carClass)).sort();
};

const processForRaceGraphForClass = (
  current: IWampData,
  newData: [][],
  currentRaceGraph: IRaceGraph[],
  picLookup: Map<string, number>
): IRaceGraph[] => {
  const carClasses = computeCarClasses(current.carInfo);
  if (carClasses.length === 0) return currentRaceGraph;

  let carClassAdditions = [...currentRaceGraph];
  carClasses.forEach((currentCarClass) => {
    carClassAdditions = internalProcessForRaceGraphForClass(
      current,
      newData,
      carClassAdditions,
      currentCarClass,
      picLookup
    );
  });
  return carClassAdditions;
};

const internalProcessForRaceGraphForClass = (
  current: IWampData,
  newData: [][],
  currentRaceGraph: IRaceGraph[],
  currentCarClass: string,
  picLookup: Map<string, number>
): IRaceGraph[] => {
  const belongsToCarClass = (dataRow: []): boolean => {
    return (getValueViaSpec(dataRow, current.manifests.car, "carClass") as string).localeCompare(currentCarClass) === 0;
  };

  const leaderEntry = newData
    .filter((dataRow) => belongsToCarClass(dataRow))
    .reduce((cur, prev) => {
      const a = getValueViaSpec(cur, current.manifests.car, "pic");
      const b = getValueViaSpec(prev, current.manifests.car, "pic");
      return a < b ? cur : prev;
    });
  if (leaderEntry === undefined) return currentRaceGraph;

  const leaderLap = getValueViaSpec(leaderEntry, current.manifests.car, "lc");
  const foundIdx = currentRaceGraph.findIndex(
    (v) => v.lapNo === leaderLap && v.carClass.localeCompare(currentCarClass) === 0
  );
  const newLapEntry: IRaceGraph = {
    carClass: currentCarClass,
    lapNo: getValueViaSpec(leaderEntry, current.manifests.car, "lc"),
    gaps: newData
      .filter((carEntry) => belongsToCarClass(carEntry))
      .map((carEntry) => ({
        gap:
          getValueViaSpec(carEntry, current.manifests.car, "gap") -
          getValueViaSpec(leaderEntry, current.manifests.car, "gap"),
        lapNo: getValueViaSpec(carEntry, current.manifests.car, "lc"),
        carNum: getValueViaSpec(carEntry, current.manifests.car, "carNum"),
        pos: getValueViaSpec(carEntry, current.manifests.car, "pos"),
        pic: picLookup.get(getValueViaSpec(carEntry, current.manifests.car, "carNum"))!,
      })),
  };
  if (foundIdx === -1) {
    return [...currentRaceGraph, newLapEntry];
  } else {
    currentRaceGraph.splice(foundIdx, 1, newLapEntry);
    return [...currentRaceGraph];
  }
};
