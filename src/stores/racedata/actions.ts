import { IMessage } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import actionCreatorFactory from "typescript-fsa";

const actionCreator = actionCreatorFactory("RACE_DATA");

export const updateAvailableCars = actionCreator<IAvailableCarsPayload[]>("UPDATE_AVAILABLE_CARS");
export interface IAvailableCarsPayload {
  carNum: string;
  name: string;
  carClass: string;
}

// session info
export const updateSessionInfo = actionCreator<IMessage>("UPDATE_SESSION_INFO");
// classification
export const updateClassification = actionCreator<IMessage>("UPDATE_CLASSIFICATION");
