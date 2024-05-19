import { Speedmap } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/speedmap/v1/speedmap_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = { ...Speedmap.create() } as Speedmap;

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
