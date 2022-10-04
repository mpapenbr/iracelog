import actionCreatorFactory from "typescript-fsa";
import { ICarClass, ICarInfo, ICarInfoContainer, IEntry } from "./types";

const actionCreator = actionCreatorFactory("CARDATA");

// car data
export const updateCarData = actionCreator<ICarInfoContainer>("UPDATE_CARDATA"); // Keep???

export const updateCarClasses = actionCreator<ICarClass[]>("UPDATE_CAR_CLASSES");
export const updateCarInfos = actionCreator<ICarInfo[]>("UPDATE_CAR_INFO");
export const updateCarEntries = actionCreator<IEntry[]>("UPDATE_CAR_ENTRIES");
