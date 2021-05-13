import {
  ICarInfo,
  ICarPitInfo,
  ICarStintInfo,
  IPitInfo,
  IProcessRaceStateData,
  IStintInfo,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import _ from "lodash";
import { ICarBaseData, ICarClass } from "../../stores/racedata/types";
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
 * @deprecated since it is based on "old" data structure. To be removed
 */
export const extractSomeCarData = (wampData: IProcessRaceStateData): IExtractedCarData => {
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
 * extracts some data around cars
 * @param carInfo
 * @returns processed

 */
export const extractSomeCarData2 = (carInfo: ICarInfo[]): IExtractedCarData => {
  const carInfoLookup = carInfo.reduce((m, cur) => {
    return m.set(cur.carNum, cur);
  }, new Map<string, ICarInfo>());
  const carClasses = _.uniq(
    carInfo.filter((v) => "".localeCompare(v.carClass || "") !== 0).map((v) => v.carClass)
  ).sort();

  const allCarNums = carInfo.length > 0 ? carInfo.map((v) => v.carNum).sort(sortCarNumberStr) : [];
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
 * @deprecated use new variant
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

interface ICarClassProcessorArgs2 {
  newSelection: string[];
  currentFilter: string[];
  currentShowCars: string[];
  cars: ICarBaseData[];
}
export const processCarClassSelectionNew = (args: ICarClassProcessorArgs2): string[] => {
  if (args.newSelection.find((v) => "All" === v)) {
    const ret = [...args.cars.map((v) => v.carNum)];
    ret.sort(sortCarNumberStr);
    return ret;
  } else {
    const lookup: Map<string, ICarBaseData> = args.cars.reduce((a, b) => {
      a.set(b.carNum, b);
      return a;
    }, new Map<string, ICarBaseData>());
    const removedClasses = new Set(_.difference(args.currentFilter, args.newSelection));
    _.remove(args.currentShowCars, (carNum) => removedClasses.has(lookup.get(carNum)!.carClass));
    // get added car classes
    const addedClasses = new Set(_.difference(args.newSelection, args.currentFilter));
    let newShowcars = _.concat(
      args.currentShowCars,
      args.cars.filter((c) => addedClasses.has(c.carClass)).map((c) => c.carNum)
    );

    newShowcars = _.uniq(newShowcars).sort(sortCarNumberStr);
    return newShowcars;
  }
};

export const collectCarsByCarClassFilter = (cars: ICarBaseData[], filterCarClasses: string[]): ICarBaseData[] => {
  if (filterCarClasses === undefined) return cars;
  if (filterCarClasses.length === 0 || filterCarClasses === ["All"]) {
    return cars;
  }
  return cars.filter((c) => filterCarClasses.find((cc) => cc === c.carClass));
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

/**
 *
 * @param carInfo as provided by BulkProcessor
 * @returns list of cars (sorted by carNum)
 */
export const extractCarBaseData = (carInfo: ICarInfo[]): ICarBaseData[] => {
  return carInfo
    .map((v) => ({ carNum: v.carNum, name: v.name, carClass: v.carClass }))
    .sort((a, b) => sortCarNumberStr(a.carNum, b.carNum));
};

/**
 *
 * @param carInfo as provided by BulkProcessor
 * @returns list of car classes  (sorted by name)
 */
export const extractCarClasses = (carInfo: ICarInfo[]): ICarClass[] => {
  const names = carInfo
    .map((v) => v.carClass)
    .reduce((prev, cur) => {
      if (cur?.length > 0) prev.add(cur);
      return prev;
    }, new Set<string>());
  return Array.from(names)
    .sort()
    .map((v) => ({ name: v }));
};
