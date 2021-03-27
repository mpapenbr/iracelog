import _ from "lodash";
import { ICarInfo, IWampData } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";

export interface ICarFilterData {
  carNum: string;
  name: string;
}

/**
 * this file holds utilities for WAMP data structures
 */

export interface IExtractedCarData {
  /**
   * get ICarInfo by carNum (string)
   */
  carInfoLookup: Map<string, ICarInfo>;
  /**
   * all carNums used in a race
   */
  allCarNums: string[];
  /**
   * all car classes used in the race (empty if no more then one class was detected)
   */
  allCarClasses: string[];
}
/**
 * extracts some data around cars
 * @param wampData
 * @returns
 */
export const extractSomeCarData = (wampData: IWampData): IExtractedCarData => {
  const carInfoLookup = wampData.carInfo.reduce((m, cur) => {
    return m.set(cur.carNum, cur);
  }, new Map<string, ICarInfo>());
  const carClasses = _.uniq(wampData.carInfo.map((v) => v.carClass));

  const allCarNums = wampData.carLaps.length > 0 ? wampData.carLaps.map((v) => v.carNum).sort(sortCarNumberStr) : [];
  return { carInfoLookup: carInfoLookup, allCarNums: allCarNums, allCarClasses: carClasses };
};

/**
 * creates the data of availableCars for CarFilter
 * @param baseData
 * @param filterCarClasses
 * @returns
 */
export const computeAvailableCars = (baseData: IExtractedCarData, filterCarClasses: string[]): ICarFilterData[] => {
  return baseData.allCarNums
    .filter((v) =>
      filterCarClasses.length === 0
        ? true
        : filterCarClasses.findIndex((fcc) => fcc === baseData.carInfoLookup.get(v)?.carClass) !== -1
    )
    .map((v) => ({ carNum: v, name: baseData.carInfoLookup.get(v)!.name }));
};
