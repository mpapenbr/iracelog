import { CarStint } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_stint_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarStint[];

export const carStintsSlice = createSlice({
  name: "carStints",
  initialState,
  reducers: {
    updateCarStints: (state, action: PayloadAction<CarStint[]>) => {
      return action.payload;
    },
    resetCarStints: () => {
      return initialState;
    },
  },
});

export const { updateCarStints, resetCarStints } = carStintsSlice.actions;
export default carStintsSlice.reducer;
