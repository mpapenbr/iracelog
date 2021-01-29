import _ from "lodash";
import { IDriverMeta } from "../../stores/drivers/types";
import { IRaceContainer } from "../../stores/raceevents/types";

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
