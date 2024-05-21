import { CarOccupancy } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_occupancy_pb";
import {
  CarPit,
  PitInfo,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_pit_pb";
import {
  CarStint,
  StintInfo,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_stint_pb";

import _ from "lodash";
import { Comparator } from "semver";
import { ICarBaseData as ICarBaseDataGrpc } from "../../stores/grpc/slices/availableCarsSlice";
import { sortCarNumberStr } from "../../utils/output";

export interface ICarFilterData {
  carNum: string;
  name: string;
}

// used when mapping a number to a string, for example: carIdx to carNum
export interface StringByNumberMap {
  [key: number]: string;
}

interface ICarClassProcessorArgs2 {
  newSelection: string[];
  currentFilter: string[];
  currentShowCars: string[];
  cars: ICarBaseDataGrpc[];
}
export const processCarClassSelectionNew = (args: ICarClassProcessorArgs2): string[] => {
  if (args.newSelection.find((v) => "All" === v)) {
    const ret = [...args.cars.map((v) => v.carNum)];
    ret.sort(sortCarNumberStr);
    return ret;
  } else {
    const lookup: Map<string, ICarBaseDataGrpc> = args.cars.reduce((a, b) => {
      a.set(b.carNum, b);
      return a;
    }, new Map<string, ICarBaseDataGrpc>());
    const removedClasses = new Set(_.difference(args.currentFilter, args.newSelection));
    const remain = args.currentShowCars.filter((v) => !removedClasses.has(lookup.get(v)!.carClass));

    // get added car classes
    const addedClasses = new Set(_.difference(args.newSelection, args.currentFilter));
    let newShowcars = _.concat(
      remain,
      args.cars.filter((c) => addedClasses.has(c.carClass)).map((c) => c.carNum),
    );

    newShowcars = _.uniq(newShowcars).sort(sortCarNumberStr);
    return newShowcars;
  }
};

export const collectCarsByCarClassFilterGrpc = (
  cars: ICarBaseDataGrpc[],
  filterCarClasses: string[],
): ICarBaseDataGrpc[] => {
  if (filterCarClasses === undefined) return cars;
  // console.log(filterCarClasses, filterCarClasses.includes("All"));
  if (filterCarClasses.length === 0 || filterCarClasses.includes("All")) {
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
export const getCarStints = (carStints: CarStint[], carNum: string): StintInfo[] => {
  const found = carStints.find((v) => v.carNum === carNum);
  if (found) {
    return [...found.history].concat(found.current?.isCurrentStint ? found.current : []);
  } else return [];
};
/**
 * convenience method to combine history and current pit stop
 * @param carPitstops all available car pit stop data
 * @param carNum
 * @returns an array with combined history and current pit stop data for the requested carNum
 */
export const getCarPitStops = (carPitstops: CarPit[], carNum: string): PitInfo[] => {
  const found = carPitstops.find((v) => v.carNum === carNum);
  if (found) {
    return [...found.history].concat(found.current?.isCurrentPitstop ? found.current : []);
  } else return [];
};

/**
 *
 * @param carOcc
 * @param stint
 * @returns the IDriverInfo of the driving the stint
 */
export const findDriverByStint = (carOcc: CarOccupancy, stint: StintInfo) =>
  carOcc.drivers.find((v) =>
    // allow 5s on leave time to cope with possible resets due to disconnects
    v.seatTimes.find(
      (st) => st.enterCarTime <= stint.exitTime && st.leaveCarTime + 5 >= stint.enterTime,
    ),
  );

/**
 *
 * @param carOccupancy
 * @param sessionTime
 * @returns the Driver entry within carOccupancy of the driving the stint
 */
export const findDriverBySessionTimeGrpc = (carInfo: CarOccupancy, sessionTime: number) => {
  const ret = carInfo.drivers.find((v) =>
    v.seatTimes.find((st) => st.enterCarTime <= sessionTime && st.leaveCarTime >= sessionTime),
  );
  if (ret !== undefined) {
    return ret;
  }
  // if session time is not in any range, select the driver with the closest gap to session time
  var foundIdx = -1;
  var gap = Number.MAX_VALUE;
  carInfo.drivers.forEach((v, i) => {
    v.seatTimes.forEach((st) => {
      var localGap = Math.abs(st.enterCarTime - sessionTime);
      if (localGap < gap) {
        gap = localGap;
        foundIdx = i;
      }
      localGap = Math.abs(st.leaveCarTime - sessionTime);
      if (localGap < gap) {
        gap = localGap;
        foundIdx = i;
      }
    });
  });
  return carInfo.drivers[foundIdx];
};

/**
 *
 * @param cars
 * @param orderByPosition if true cars are ordered by race position
 * @param provideOrderedCarNums a function that provides the carNums ordered by the current race positions
 * @returns a sorted copy cars
 *
 */
export const sortedSelectableCarsGrpc = (
  cars: ICarBaseDataGrpc[],
  orderByPosition: boolean,
  provideOrderedCarNums: () => string[],
): ICarBaseDataGrpc[] => {
  if (orderByPosition) {
    const carNumsByPos = provideOrderedCarNums();
    const sortBySetting = (a: ICarBaseDataGrpc, b: ICarBaseDataGrpc): number => {
      return carNumsByPos.indexOf(a.carNum) - carNumsByPos.indexOf(b.carNum);
    };
    return cars.slice().sort(sortBySetting);
  }
  return cars.slice().sort((a, b) => sortCarNumberStr(a.carNum, b.carNum));
};

/**
 *
 * @param si IStintInfo to investigate
 * @param range upper and lower bound
 * @returns true if either start and/or end of stint is within range
 */
export const isInSelectedRange = (si: StintInfo, range: [number, number]): boolean => {
  return (
    _.inRange(si.enterTime, range[0], range[1]) ||
    _.inRange(si.exitTime, range[0], range[1]) ||
    (si.exitTime <= range[0] && si.enterTime >= range[1])
  );
};

export const supportsCarData = (raceloggerVersion: string): boolean => {
  return new Comparator(">=0.4.4").test(raceloggerVersion);
};
