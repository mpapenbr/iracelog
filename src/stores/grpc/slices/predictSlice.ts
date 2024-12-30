import {
  PredictParam,
  PredictParamSchema,
  PredictResult,
  PredictResultSchema,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import { create } from "@bufbuild/protobuf";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface PredictResultByNumberMap {
  [key: string]: PredictResult;
}

export interface PredictParamByNumberMap {
  [key: string]: PredictParam;
}

export interface PredictData {
  carNum: string;
  p: PredictParam;
  r: PredictResult;
}
export interface PredictSliceData {
  raceLeader: PredictData;

  byCarNum: { [key: string]: PredictData };
}
const initialState = {
  raceLeader: { carNum: "", r: create(PredictResultSchema), p: create(PredictParamSchema) },
  byCarNum: {},
} as PredictSliceData;

export const predictSlice = createSlice({
  name: "predict",
  initialState,
  reducers: {
    mergePredictData: (state, action: PayloadAction<PredictData>) => {
      const work = { ...state.byCarNum };
      work[action.payload.carNum] = action.payload;
      state.byCarNum = work;
    },

    setRaceLeaderResult: (state, action: PayloadAction<PredictData>) => {
      state.raceLeader = action.payload;
    },
    resetPredictions: () => {
      return initialState;
    },
  },
});

export const {
  setRaceLeaderResult,
  mergePredictData,

  resetPredictions,
} = predictSlice.actions;
export default predictSlice.reducer;
