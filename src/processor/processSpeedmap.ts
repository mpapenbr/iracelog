import { Dispatch } from "redux";
import { ISpeedmapMessage } from "../stores/racedata/types";
import { updateSpeedmapData } from "../stores/speedmap/actions";

export interface IProcessSpeedmapInfo {
  dummy: number;
}
/*
type:
timestamp:
payload:
  data:
    key: number[]
*/
export const processSpeedmap = (dispatch: Dispatch, msg: ISpeedmapMessage) => {
  // console.log(msg);
  dispatch(updateSpeedmapData(msg.payload))
};
