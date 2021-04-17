/**
 * contains computations for raceOrder
 */

import { IWampData } from "../types";
import { getValueViaSpec } from "./util";

export const processForRaceOrder = (current: IWampData, newData: [][]): string[] => {
  return newData.map((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");
    return currentCarNum;
  });
};
