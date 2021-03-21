/**
 * contains computations for driver list
 */

import { ICarInfo, IWampData } from "../types";
import { getValueViaSpec } from "./util";

export const processForCarInfo = (current: IWampData, sessionTime: number, carsData: [][]): ICarInfo[] => {
  let newCarInfos = [] as ICarInfo[];

  carsData.forEach((carEntry) => {
    const currentCarNum = getValueViaSpec(carEntry, current.manifests.car, "carNum");
    const currentTeamName = getValueViaSpec(carEntry, current.manifests.car, "teamName");
    const currentDriverName = getValueViaSpec(carEntry, current.manifests.car, "userName");

    const newDriverEntry = () => ({
      driverName: currentDriverName,
      seatTime: [{ enterCarTime: sessionTime, leaveCarTime: sessionTime }],
    });
    let csEntry = current.carInfo.find((v) => v.carNum === currentCarNum);
    if (csEntry === undefined) {
      let currentEntry = newDriverEntry();
      csEntry = {
        carNum: currentCarNum,
        name: currentTeamName,
        drivers: [currentEntry],
        current: newDriverEntry(),
      };
    } else {
      const cur = csEntry.drivers.find((d) => d.driverName === currentDriverName);
      if (cur === undefined) {
        csEntry.drivers.push(newDriverEntry());
        csEntry.current = newDriverEntry();
      } else {
        if (csEntry.current.driverName === currentDriverName) {
          csEntry.current.seatTime[csEntry.current.seatTime.length - 1].leaveCarTime = sessionTime;
          cur.seatTime[cur.seatTime.length - 1].leaveCarTime = sessionTime;
        } else {
          const tmp = { ...cur };
          tmp.seatTime.push({ enterCarTime: sessionTime, leaveCarTime: sessionTime });
          csEntry.current = tmp;
        }
      }
    }
    newCarInfos.push(csEntry);
  });
  return newCarInfos;
};
