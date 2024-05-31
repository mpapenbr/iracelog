import { LiveSpeedmapResponse } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/livedata/v1/live_service_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { ISpeedmapEvolution } from "../../speedmap/types";

// TODO: just a dummy, needs to be implemented

const initialState = [] as ISpeedmapEvolution[];

export const speedmapEvolutionSlice = createSlice({
  name: "speedmapEvolution",
  initialState,
  reducers: {
    updateSpeedmapEvolution: (state, action: PayloadAction<LiveSpeedmapResponse>) => {
      return state;
    },
    resetSpeedmapEvolution: () => {
      return initialState;
    },
  },
});

export const { updateSpeedmapEvolution, resetSpeedmapEvolution } = speedmapEvolutionSlice.actions;
export default speedmapEvolutionSlice.reducer;
