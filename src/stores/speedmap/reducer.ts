import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import { initialSpeedmap, initialSpeedmapData, ISpeedmap, ISpeedmapData } from "./types";
import * as SpeedmapActions from "./actions";

const SpeedmapDataReducer = reducerWithInitialState(initialSpeedmapData).case(
    SpeedmapActions.updateSpeedmapData,
    (state, data) => {
        // console.log(data)
        return { ...data }
    }
);


const combinedReducers = combineReducers<ISpeedmap>({

    speedmapData: SpeedmapDataReducer,
});

export { combinedReducers as speedmapReducers };
