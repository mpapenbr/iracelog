import actionCreatorFactory from "typescript-fsa";
import { ISpeedmapData, ISpeedmapEvolution } from "./types";

const actionCreator = actionCreatorFactory("SPEEDMAP");

// speedmap data
export const updateSpeedmapData = actionCreator<ISpeedmapData>("UPDATE_SPEEDMAP");
export const updateSpeedmapEvolution = actionCreator<ISpeedmapEvolution[]>(
  "UPDATE_SPEEDMAP_EVOLUTION",
);
