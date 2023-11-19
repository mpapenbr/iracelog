import { Dispatch } from "redux";
import { updateCarClasses, updateCarEntries, updateCarInfos } from "../stores/cars/actions";
import { ICarClass, ICarInfoContainer } from "../stores/cars/types";
import { updateAvailableCarClasses, updateAvailableCars } from "../stores/racedata/actions";
import { ICarBaseData } from "../stores/racedata/types";
import { sortCarNumberStr } from "../utils/output";

/*
type:
timestamp:
payload:
  data:
    key: number[]
*/
export interface ICarDataMessage {
  type: number;
  timestamp: number;
  payload: ICarInfoContainer;
}
export const processCarData = (dispatch: Dispatch, msg: ICarDataMessage) => {
  // console.log(msg);
  // dispatch(updateCarData(msg.payload));

  const carClassLookup = msg.payload.carClasses.reduce((m, cur) => {
    return m.set(cur.id, cur);
  }, new Map<number, ICarClass>());
  const carBaseData: ICarBaseData[] = msg.payload.entries
    .map(
      (v) =>
        ({
          carNum: v.car.carNumber,
          name: v.team.name,
          carClass: carClassLookup.get(v.car.carClassId)?.name ?? "n.a.",
        }) as ICarBaseData,
    )
    .sort((a, b) => sortCarNumberStr(a.carNum, b.carNum));
  dispatch(updateCarInfos(msg.payload.cars));
  dispatch(updateCarClasses(msg.payload.carClasses));
  dispatch(updateCarEntries(msg.payload.entries));
  dispatch(updateAvailableCarClasses(msg.payload.carClasses));
  dispatch(updateAvailableCars(carBaseData));
};
