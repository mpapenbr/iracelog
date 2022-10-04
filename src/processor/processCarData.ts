import { Dispatch } from "redux";
import { updateCarClasses, updateCarEntries, updateCarInfos } from "../stores/cars/actions";
import { ICarInfoContainer } from "../stores/cars/types";

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
  dispatch(updateCarInfos(msg.payload.cars));
  dispatch(updateCarClasses(msg.payload.carClasses));
  dispatch(updateCarEntries(msg.payload.entries));
};
