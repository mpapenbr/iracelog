import _ from "lodash";
import { IDriverMeta } from "../../stores/drivers/types";
import { IRaceContainer } from "../../stores/raceevents/types";

export function extractRaceUUID(pathname: string): string {
  const regex = /.*?\/details\/(?<myId>.*?)\/.*$/;
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

export const teamNames = (carIdx: number, rc: IRaceContainer) => {
  const rawNames = rc.drivers.filter((d) => d.data.carIdx === carIdx).map((d) => d.data.userName);
  const nameSet = _.uniq(rawNames);
  return nameSet;
};
