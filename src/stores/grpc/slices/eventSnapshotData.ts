import { SnapshotData } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/snapshot_data_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// TODO: just a dummy, needs to be implemented

const initialState = [] as SnapshotData[];

export const eventSnapshotDataSlice = createSlice({
  name: "eventSnapshotData",
  initialState,
  reducers: {
    initSnapshotData: (state, action: PayloadAction<SnapshotData[]>) => {
      return action.payload;
    },
    updateSnapshotData: (state, action: PayloadAction<SnapshotData>) => {
      state.push(action.payload);
    },
    resetSnapshotData: () => {
      return initialState;
    },
  },
});

export const { initSnapshotData, updateSnapshotData, resetSnapshotData } =
  eventSnapshotDataSlice.actions;
export default eventSnapshotDataSlice.reducer;
