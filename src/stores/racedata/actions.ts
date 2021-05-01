import actionCreatorFactory from "typescript-fsa";

const actionCreator = actionCreatorFactory("RACE_DATA");

export const updateAvailableCars = actionCreator<IAvailableCarsPayload[]>("UPDATE_AVAILABLE_CARS");
export interface IAvailableCarsPayload {
  carNum: string;
  name: string;
  carClass: string;
}
