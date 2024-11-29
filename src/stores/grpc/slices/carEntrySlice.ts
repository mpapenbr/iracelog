import { CarEntry } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/car/v1/car_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarEntry[];

export const carEntrySlice = createSlice({
  name: "carEntry",
  initialState,
  reducers: {
    updateCarEntries: (state, action: PayloadAction<CarEntry[]>) => {
      return action.payload;
    },
    resetCarEntries: () => {
      return initialState;
    },
  },
});

export const { updateCarEntries, resetCarEntries } = carEntrySlice.actions;
export default carEntrySlice.reducer;
