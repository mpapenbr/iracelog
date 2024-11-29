import { CarInfo } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/car/v1/car_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarInfo[];

export const carInfoSlice = createSlice({
  name: "carInfo",
  initialState,
  reducers: {
    updateCarInfo: (state, action: PayloadAction<CarInfo[]>) => {
      return action.payload;
    },
    resetCarInfo: () => {
      return initialState;
    },
  },
});

export const { updateCarInfo, resetCarInfo } = carInfoSlice.actions;
export default carInfoSlice.reducer;
