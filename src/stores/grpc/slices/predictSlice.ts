import {
  PredictResult,
  PredictResultSchema,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import { create } from "@bufbuild/protobuf";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface PredictResultByNumberMap {
  [key: string]: PredictResult;
}

export interface PredictData {
  raceLeader: PredictResult;
  byCarNum: PredictResultByNumberMap;
}
const initialState = { raceLeader: create(PredictResultSchema), byCarNum: {} } as PredictData;

export const predictSlice = createSlice({
  name: "predict",
  initialState,
  reducers: {
    mergePredictResult: (
      state,
      action: PayloadAction<{ carNum: string; result: PredictResult }>,
    ) => {
      const work = { ...state.byCarNum };
      work[action.payload.carNum] = action.payload.result;
      state.byCarNum = work;
    },
    setRaceLeaderResult: (state, action: PayloadAction<PredictResult>) => {
      state.raceLeader = action.payload;
    },
    resetPredictions: () => {
      return initialState;
    },
  },
});

export const { setRaceLeaderResult, mergePredictResult, resetPredictions } = predictSlice.actions;
export default predictSlice.reducer;
