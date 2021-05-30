import {
  ICarInfo,
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IProcessRaceStateData,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { diff } from "deep-object-diff";
import _ from "lodash";
import { extractCarBaseData, extractCarClasses } from "../components/live/util";
import { ICarBaseData, ICarClass } from "../stores/racedata/types";

export interface IProcessingInfo {
  currentData: IProcessRaceStateData;
  newData: IProcessRaceStateData;
  onChangedSession?: (s: IMessage) => void;
  onChangedClassification?: (s: IMessage) => void;
  onChangedAvailableCars?: (newData: ICarBaseData[]) => void;
  onChangedAvailableCarClasses?: (newData: ICarClass[]) => void;
  onChangedCarInfos?: (newData: ICarInfo[]) => void;
  onChangedRaceGraph?: (newData: IRaceGraph[]) => void;
  onChangedCarLaps?: (newData: ICarLaps[]) => void;
  onChangedCarStints?: (newData: ICarStintInfo[]) => void;
  onChangedCarPits?: (newData: ICarPitInfo[]) => void;
  onChangedInfoMessages?: (newData: IMessage[]) => void;
}
export const distributeChanges = (args: IProcessingInfo) => {
  // session
  if (args.newData.session) {
    if (args.currentData.session) {
      if (!_.isEmpty(diff(args.currentData.session, args.newData.session))) {
        args.onChangedSession?.(args.newData.session);
      }
    } else {
      args.onChangedSession?.(args.newData.session);
    }
  }
  // classification
  if (args.newData.cars) {
    if (args.currentData.cars) {
      if (!_.isEmpty(diff(args.currentData.cars, args.newData.cars))) {
        args.onChangedClassification?.(args.newData.cars);
      }
    } else {
      args.onChangedClassification?.(args.newData.cars);
    }
  }

  // available cars / car classes
  if (!_.isEmpty(diff(args.currentData.carInfo, args.newData.carInfo))) {
    args.onChangedCarInfos?.(args.newData.carInfo);
    const baseCurrent = extractCarBaseData(args.currentData.carInfo);
    const baseNew = extractCarBaseData(args.newData.carInfo);
    if (!_.isEmpty(diff(baseNew, baseCurrent))) {
      args.onChangedAvailableCars?.(baseNew);
      // additional check the car classes
      const classesCurrent: ICarClass[] = extractCarClasses(args.currentData.carInfo);
      const classesNew: ICarClass[] = extractCarClasses(args.newData.carInfo);
      if (!_.isEmpty(diff(classesNew, classesCurrent))) {
      }
      args.onChangedAvailableCarClasses?.(classesNew);
    }
  }
  // raceGraph
  if (!_.isEmpty(diff(args.currentData.raceGraph, args.newData.raceGraph))) {
    args.onChangedRaceGraph?.(args.newData.raceGraph);
  }

  // carLaps
  if (!_.isEmpty(diff(args.currentData.carLaps, args.newData.carLaps))) {
    args.onChangedCarLaps?.(args.newData.carLaps);
  }
  // carStints
  if (!_.isEmpty(diff(args.currentData.carStints, args.newData.carStints))) {
    args.onChangedCarStints?.(args.newData.carStints);
  }
  // carPits
  if (!_.isEmpty(diff(args.currentData.carPits, args.newData.carPits))) {
    args.onChangedCarPits?.(args.newData.carPits);
  }
  // info messages
  if (!_.isEmpty(diff(args.currentData.infoMsgs, args.newData.infoMsgs))) {
    args.onChangedInfoMessages?.(args.newData.infoMsgs);
  }
};
