import { IMessage, IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { diff } from "deep-object-diff";
import _ from "lodash";
import { extractSomeCarData } from "../components/live/util";

export interface IProcessingInfo {
  currentData: IProcessRaceStateData;
  newData: IProcessRaceStateData;
  onChangedSession?: (s: IMessage) => void;
  onChangedClassification?: (s: IMessage) => void;
}
export const distributeChanges = (args: IProcessingInfo) => {
  // session
  if (args.newData.session) {
    if (args.currentData.session) {
      if (!_.isEmpty(diff(args.currentData.session, args.newData.session))) {
        if (args.onChangedSession) args.onChangedSession(args.newData.session);
      }
    } else {
      if (args.onChangedSession) args.onChangedSession(args.newData.session);
    }
  }
  // classification
  if (args.newData.cars) {
    if (args.currentData.cars) {
      if (!_.isEmpty(diff(args.currentData.cars, args.newData.cars))) {
        if (args.onChangedClassification) args.onChangedClassification(args.newData.cars);
      }
    } else {
      if (args.onChangedClassification) args.onChangedClassification(args.newData.cars);
    }
  }
  // available cars
  const newCarData = extractSomeCarData(args.newData);
  const currentCarData = extractSomeCarData(args.currentData);
  if (!_.isEmpty(newCarData.allCarNums)) {
  }
};
