import _ from "lodash";
import { defaultDriverData, IDriver, IDriverMeta } from "../../stores/drivers/types";
import { IRaceContainer } from "../../stores/raceevents/types";
import { IStintData } from "../../stores/types/stints";
import { secAsMMSS } from "../../utils/output";

export function extractRaceUUID(pathname: string): string {
  const regex = /.*?\/details\/(?<myId>.*?)(\/.*)?$/;
  const { myId } = pathname.match(regex)?.groups!;
  return myId;
}

export const teamDrivers = (carIdx: number, rc: IRaceContainer) => {
  const rawNames = rc.drivers.filter((d) => d.data.carIdx === carIdx).map((d) => d.data.userName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};

export const teamDriverData = (carIdx: number, rc: IRaceContainer): IDriverMeta[] => {
  return rc.drivers
    .filter((d) => d.data.carIdx === carIdx)
    .reduce((a: IDriverMeta[], b: IDriverMeta) => {
      if (a.findIndex((d) => d.data.userName === b.data.userName) === -1) {
        a.push(b);
      }
      return a;
    }, []);
};

export const teamNames = (rc: IRaceContainer) => {
  const rawNames = rc.drivers.map((d) => d.data.teamName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};

export const driverNames = (rc: IRaceContainer) => {
  const rawNames = rc.drivers.map((d) => d.data.userName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};

export const carNames = (rc: IRaceContainer) => {
  const rawNames = rc.drivers.map((d) => d.data.carName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};

export const iRatingAvg = (rc: IRaceContainer) => {
  return (
    rc.drivers.reduce((a: number, b: IDriverMeta) => {
      return a + b.data.iRating;
    }, 0) / rc.drivers.length
  );
};
interface CarClassAvg {
  id: number;
  name: string;
  value: number;
  count: number;
  avg: number;
}
export const collectCarClassesIratingAvg = (data: IRaceContainer): CarClassAvg[] => {
  const ret = data.drivers
    .reduce((a: CarClassAvg[], b: IDriverMeta) => {
      const work = a.find((d) => d.id == b.data.carClassId);
      if (work === undefined) {
        a.push({ id: b.data.carClassId, name: b.data.carClassShortName, value: b.data.iRating, count: 1, avg: 0 });
      } else {
        work.count++;
        work.value += b.data.iRating;
      }
      return a;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));
  ret.forEach((d) => (d.avg = d.value / d.count));
  return ret;
};

interface IdName {
  id: number;
  name: string;
}

export const collectCarClasses = (data: IDriverMeta[]): IdName[] => {
  return data
    .reduce((a: IdName[], b: IDriverMeta) => {
      if (a.findIndex((d) => d.id === b.data.carClassId) === -1) {
        a.push({ id: b.data.carClassId, name: b.data.carClassShortName });
      }
      return a;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const collectCars = (data: IDriverMeta[]): IdName[] => {
  return data
    .reduce((a: IdName[], b: IDriverMeta) => {
      if (a.findIndex((d) => d.id === b.data.carId) === -1) {
        a.push({ id: b.data.carId, name: b.data.carName });
      }
      return a;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const closestDriverEntryByTime = (
  driverData: IDriverMeta[],
  carIdx: number,
  sessionNum: number,
  sessionTime: number
): IDriver => {
  const invSortedByTime = driverData
    .filter((d) => d.data.carIdx === carIdx)
    .filter((d) => d.sessionNum == sessionNum)
    .filter((d) => d.sessionTime <= sessionTime)
    .sort((a, b) => b.sessionTime - a.sessionTime);
  // console.log(invSortedByTime);
  return invSortedByTime.length > 0 ? invSortedByTime[0].data : defaultDriverData();
};

export const stintDuration = (d: IStintData): string => {
  if (d.laps.length === 0) {
    return "n.a.";
  }
  const dur = _.last(d.laps)!.sessionTime + _.last(d.laps)!.lapData.lapTime - d.laps[0].sessionTime;
  return secAsMMSS(dur);
};
