/**
 * contains computations for raceGraph
 */

import { defaultPitInfo, defaultStintInfo, ICarPitInfo, ICarStintInfo, IWampData, PitManifest } from "../types";
import { getValueViaSpec } from "./util";

interface IColData {
  value: number | [number, string];
}

export const processPitData = (payloadData: [][], currentStateData: ICarPitInfo[]): ICarPitInfo[] => {
  // console.log({ payloadData });
  if (payloadData.length === 0) return currentStateData;

  let workData = [...currentStateData];
  payloadData.forEach((e: []) => {
    const num = getValueViaSpec(e, PitManifest, "carNum");
    // console.log(num);
    let found = workData.find((d) => d.carNum === num);
    if (found === undefined) {
      found = { carNum: num, current: { ...defaultPitInfo, carNum: num }, history: [] };
      workData.push(found);
    }
    const what = getValueViaSpec(e, PitManifest, "type");
    if (what === "enter") {
      found.current.enterTime = getValueViaSpec(e, PitManifest, "enterTime");
      found.current.stintTime = getValueViaSpec(e, PitManifest, "stintTime");
      found.current.numLaps = getValueViaSpec(e, PitManifest, "lapEnter") - found.current.lapExit;
      found.current.lapEnter = getValueViaSpec(e, PitManifest, "lapEnter");
    }
    if (what === "exit") {
      found.current.laneTime = getValueViaSpec(e, PitManifest, "laneTime");
      found.history.push({ ...found.current });
      found.current.exitTime = getValueViaSpec(e, PitManifest, "exitTime");
      found.current.lapExit = getValueViaSpec(e, PitManifest, "lapExit");
    }
  });
  return workData;
};

export const processForCurrentStint = (current: IWampData, sessionTime: number, carsData: [][]): ICarStintInfo[] => {
  let newCarStints = [] as ICarStintInfo[];
  carsData.forEach((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");
    const currentCarLap = getValueViaSpec(carEntry, current.manifests.car, "lap");
    const currentCarLapTime = getValueViaSpec(carEntry, current.manifests.car, "last");

    if (currentCarLap < 1) return;

    let csEntry = current.carStints.find((v) => v.carNum === currentCarNum);
    if (csEntry === undefined) {
      csEntry = {
        current: { ...defaultStintInfo, exitTime: sessionTime, lapExit: currentCarLap, isCurrentStint: true },
        carNum: currentCarNum,
        history: [],
      };
    } else {
      if (csEntry.current.isCurrentStint) {
        csEntry.current.stintTime = sessionTime - csEntry.current.exitTime;
        csEntry.current.numLaps = currentCarLap - csEntry.current.lapExit;
      }
    }
    newCarStints.push(csEntry);
  });
  return newCarStints;
};

export const processStintData = (payloadData: [][], currentStateData: ICarStintInfo[]): ICarStintInfo[] => {
  // console.log({ payloadData });
  // console.log({ payloadData });
  if (payloadData.length === 0) return currentStateData;

  let workData = [...currentStateData];

  // for each car we need to ensure an entry

  payloadData.forEach((e: []) => {
    const num = getValueViaSpec(e, PitManifest, "carNum");
    // console.log(num);
    let found = workData.find((d) => d.carNum === num);
    if (found === undefined) {
      found = { carNum: num, current: { ...defaultStintInfo, carNum: num }, history: [] };
      workData.push(found);
    }
    const what = getValueViaSpec(e, PitManifest, "type");
    if (what === "enter") {
      found.current.enterTime = getValueViaSpec(e, PitManifest, "enterTime");
      found.current.stintTime = getValueViaSpec(e, PitManifest, "stintTime");
      found.current.numLaps = getValueViaSpec(e, PitManifest, "lapEnter") - found.current.lapExit;
      found.current.lapEnter = getValueViaSpec(e, PitManifest, "lapEnter");
      found.current.isCurrentStint = false;
      found.history.push({ ...found.current });
    }
    if (what === "exit") {
      found.current.stintTime = 0;
      found.current.numLaps = 0;
      found.current.isCurrentStint = true;
      found.current.exitTime = getValueViaSpec(e, PitManifest, "exitTime");
      found.current.lapExit = getValueViaSpec(e, PitManifest, "lapExit");
    }
  });
  return workData;
};
