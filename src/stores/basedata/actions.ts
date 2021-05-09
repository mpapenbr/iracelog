import actionCreatorFactory from "typescript-fsa";

// *INFO* Not sure if this stays. Maybe it's a better idea to have them in RaceData

const actionCreator = actionCreatorFactory("BASE_DATA");

export const updateAvailableCars = actionCreator<IAvailableCarsPayload[]>("UPDATE_AVAILABLE_CARS");
export interface IAvailableCarsPayload {
  carNum: string;
  name: string;
  carClass: string;
}
