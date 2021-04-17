/**
 * contains computations for raceGraph
 */

import {
  CarComputeState,
  defaultPitInfo,
  defaultStintInfo,
  ICarComputeState,
  ICarPitInfo,
  ICarStintInfo,
  IPitInfo,
  IWampData,
  PitManifest,
} from "../types";
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
        csEntry.current.numLaps = currentCarLap - csEntry.current.lapExit + 1;
        csEntry.current.lapEnter = currentCarLap;
      }
    }
    newCarStints.push(csEntry);
  });
  return newCarStints;
};

/*

*/

const getCarComputeStates = (current: IWampData, carsData: [][]): Map<string, ICarComputeState> => {
  let ret = new Map();
  carsData.forEach((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");

    let csEntry = current.carComputeState.find((v) => v.carNum === currentCarNum);
    if (csEntry === undefined) {
      ret.set(currentCarNum, {
        carNum: currentCarNum,
        state: CarComputeState.INIT,
      });
    } else ret.set(currentCarNum, csEntry);
  });
  return ret;
};

interface Tmp {
  carComputeState: ICarComputeState[];
  carStints: ICarStintInfo[];
  carPits: ICarPitInfo[];
}
export const processForStint2 = (current: IWampData, sessionTime: number, carsData: [][]): Tmp => {
  let newCarStints = [] as ICarStintInfo[];
  let carComputeState = getCarComputeStates(current, carsData);
  const carStintsLookup = new Map<string, ICarStintInfo>();
  current.carStints.forEach((a) => {
    carStintsLookup.set(a.carNum, a);
  });
  const carPitsLookup = new Map<string, ICarPitInfo>();
  current.carPits.forEach((a) => {
    carPitsLookup.set(a.carNum, a);
  });
  carsData.forEach((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");
    const currentCarLap = getValueViaSpec(carEntry, current.manifests.car, "lap");
    const currentCarState = getValueViaSpec(carEntry, current.manifests.car, "state");
    if (currentCarLap < 1) return;

    const ccs = carComputeState.get(currentCarNum)!;
    switch (ccs.state) {
      case CarComputeState.INIT:
        {
          switch (currentCarState) {
            case "RUN":
              const newEntry: ICarStintInfo = {
                carNum: currentCarNum,
                current: {
                  ...defaultStintInfo,
                  carNum: currentCarNum,
                  exitTime: sessionTime,
                  lapExit: currentCarLap,
                  isCurrentStint: true,
                },
                history: [],
              };
              carStintsLookup.set(currentCarNum, newEntry);
              ccs.state = CarComputeState.RUN;

              break;

            case "PIT":
              break;
            default:
              break; // do nothing
          }
        }
        break;
      case CarComputeState.RUN:
        {
          const x = carStintsLookup.get(currentCarNum)!;
          x.current.enterTime = sessionTime;
          x.current.lapEnter = currentCarLap;
          x.current.numLaps = currentCarLap - x.current.lapExit + 1;
          x.current.stintTime = sessionTime - x.current.exitTime;
          switch (currentCarState) {
            case "RUN":
              break;
            case "OUT":
              console.log("surprise - got OUT state for " + currentCarNum + " in state RUN");
              break;
            case "PIT":
              x.current.isCurrentStint = false;
              x.history.push({ ...x.current });
              ccs.state = CarComputeState.PIT;

              const newPitEntry: IPitInfo = {
                ...defaultPitInfo,
                carNum: currentCarNum,
                lapEnter: currentCarLap,
                enterTime: sessionTime,
                isCurrentPitstop: true,
              };
              let carPitEntry = carPitsLookup.get(currentCarNum);
              if (carPitEntry === undefined) {
                carPitsLookup.set(currentCarNum, { carNum: currentCarNum, current: newPitEntry, history: [] });
              } else {
                carPitEntry.current = newPitEntry;
              }
              break;
          }
        }
        break;
      case CarComputeState.PIT: {
        const carPitEntry = carPitsLookup.get(currentCarNum)!;
        carPitEntry.current.exitTime = sessionTime;
        carPitEntry.current.lapExit = currentCarLap;
        carPitEntry.current.laneTime = sessionTime - carPitEntry.current.enterTime;
        switch (currentCarState) {
          case "RUN":
            carPitEntry.current.isCurrentPitstop = false;
            carPitEntry.history.push(carPitEntry.current);

            const x = carStintsLookup.get(currentCarNum)!;
            x.current = {
              ...defaultStintInfo,
              carNum: currentCarNum,
              exitTime: sessionTime,
              lapExit: currentCarLap,
              isCurrentStint: true,
            };
            ccs.state = CarComputeState.RUN;
            break;

          case "PIT":
            break;
        }
      }
    }
  });

  return {
    carStints: Array.from(carStintsLookup.values()),
    carPits: Array.from(carPitsLookup.values()),
    carComputeState: Array.from(carComputeState.values()),
  };
};
