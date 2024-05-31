import { CarEntry } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/car/v1/car_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// used when mapping a number to a string, for example: carIdx to carNum
export interface StringByNumberMap {
  [key: number]: string;
}
export interface ByIdxLookup {
  carNum: StringByNumberMap;
}

const initialState = {
  carNum: {},
} as ByIdxLookup;

export const byIdxLookupSlice = createSlice({
  name: "byIdxLookup",
  initialState,
  reducers: {
    updateForCarNumFromDriverData: (state, action: PayloadAction<CarEntry[]>) => {
      Object.entries(state.carNum);
      const carEntries = action.payload;

      if (carEntries.length != Object.entries(state.carNum).length) {
        console.log(`change in driver count detected`);
        const cRef = Object.assign(
          {},
          ...carEntries.map((e) => ({ [e.car?.carIdx!]: e.car?.carNumber })),
        );
        state.carNum = cRef;
      }
    },
    resetNumByIdxLookup: () => {
      return initialState;
    },
  },
});

export const { updateForCarNumFromDriverData, resetNumByIdxLookup: resetByIdxLookup } =
  byIdxLookupSlice.actions;
export default byIdxLookupSlice.reducer;
