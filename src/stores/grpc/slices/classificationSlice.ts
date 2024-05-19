import { Car } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/racestate/v1/racestate_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as Car[];

export const classificationSlice = createSlice({
  name: "classification",
  initialState,
  reducers: {
    updateClassification: (state, action: PayloadAction<Car[]>) => {
      return action.payload;
    },
    resetClassification: () => {
      return initialState;
    },
  },
});

export const { updateClassification, resetClassification } = classificationSlice.actions;
export default classificationSlice.reducer;
