import actionCreatorFactory from "typescript-fsa";
import { ISpeedmap, ISpeedmapData } from "./types";

const actionCreator = actionCreatorFactory("SPEEDMAP");

// speedmap data
export const updateSpeedmapData = actionCreator<ISpeedmapData>("UPDATE_SPEEDMAP"); 