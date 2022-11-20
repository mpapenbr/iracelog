import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as SpeedmapActions from "./actions";
import { initialSpeedmapData, ISpeedmap, ISpeedmapEvolution } from "./types";

const SpeedmapDataReducer = reducerWithInitialState(initialSpeedmapData).case(
  SpeedmapActions.updateSpeedmapData,
  (state, data) => {
    // console.log(data)
    return { ...data };
  },
);

const SpeedmapEvolutionReducer = reducerWithInitialState([] as ISpeedmapEvolution[]).case(
  SpeedmapActions.updateSpeedmapEvolution,
  (state, data) => {
    // console.log(data)
    return [...data];
  },
);

const combinedReducers = combineReducers<ISpeedmap>({
  speedmapData: SpeedmapDataReducer,
  speedmapEvolution: SpeedmapEvolutionReducer,
});

export { combinedReducers as speedmapReducers };
