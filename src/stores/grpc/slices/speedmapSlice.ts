import {
  Speedmap,
  SpeedmapSchema,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/speedmap/v1/speedmap_pb";
import { create } from "@bufbuild/protobuf";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = { ...create(SpeedmapSchema) } as Speedmap;

export const speedmapSlice = createSlice({
  name: "speedmap",
  initialState,
  reducers: {
    updateSpeedmap: (state, action: PayloadAction<Speedmap>) => {
      return action.payload;
    },
    resetSpeedmap: () => {
      return initialState;
    },
  },
});

export const { updateSpeedmap, resetSpeedmap } = speedmapSlice.actions;
export default speedmapSlice.reducer;
