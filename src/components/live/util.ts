import _ from "lodash";
import { ICarInfo, ICarPitInfo, ICarStintInfo, IPitInfo, IStintInfo, IWampData } from "../../stores/wamp/types";
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
  const carClasses = _.uniq(
    wampData.carInfo.filter((v) => "".localeCompare(v.carClass || "") !== 0).map((v) => v.carClass)
  ).sort();

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
    .filter((v) => {
      if (filterCarClasses.length === 0) {
        return true;
      } else {
        if (filterCarClasses.find((v) => "All".localeCompare(v) === 0) !== undefined) {
          return true;
        } else return filterCarClasses.findIndex((fcc) => fcc === baseData.carInfoLookup.get(v)?.carClass) !== -1;
      }
    })
    .sort(sortCarNumberStr)
    .map((v) => ({ carNum: v, name: baseData.carInfoLookup.get(v)!.name }));
};

/**
 * Arguments for processCarClassSelection
 */
interface ICarClassProcessorArgs {
  newSelection: string[];
  currentFilter: string[];
  currentShowCars: string[];
  carDataContainer: IExtractedCarData;
}

/**
 * can be called when the user changes the car class filter.
 * @param args
 * @returns
 */
export const processCarClassSelection = (args: ICarClassProcessorArgs): string[] => {
  if (args.newSelection.findIndex((v) => "All".localeCompare(v) === 0) !== -1) {
    const ret = [...args.carDataContainer.allCarNums];
    ret.sort(sortCarNumberStr);
    return ret;
  } else {
    const removedClasses = new Set(_.difference(args.currentFilter, args.newSelection));
    _.remove(args.currentShowCars, (carNum) =>
      removedClasses.has(args.carDataContainer.carInfoLookup.get(carNum)!.carClass)
    );
    // get added car classes
    const addedClasses = new Set(_.difference(args.newSelection, args.currentFilter));
    let newShowcars = _.concat(
      args.currentShowCars,
      args.carDataContainer.allCarNums.filter((carNum) =>
        addedClasses.has(args.carDataContainer.carInfoLookup.get(carNum)!.carClass)
      )
    );
    newShowcars = _.uniq(newShowcars).sort(sortCarNumberStr);
    return newShowcars;
  }
};

/**
 * convenience method to combine history and current stint
 * @param carStints all available car stint data
 * @param carNum
 * @returns an array with combined history and current stint data for the requested carNum
 */
export const getCarStints = (carStints: ICarStintInfo[], carNum: string): IStintInfo[] => {
  const found = carStints.find((v) => v.carNum === carNum);
  if (found) {
    return [...found.history].concat(found.current.isCurrentStint ? found.current : []);
  } else return [];
};
/**
 * convenience method to combine history and current pit stop
 * @param carPitstops all available car pit stop data
 * @param carNum
 * @returns an array with combined history and current pit stop data for the requested carNum
 */
export const getCarPitStops = (carPitstops: ICarPitInfo[], carNum: string): IPitInfo[] => {
  const found = carPitstops.find((v) => v.carNum === carNum);
  if (found) {
    return [...found.history].concat(found.current.isCurrentPitstop ? found.current : []);
  } else return [];
};
