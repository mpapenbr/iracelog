import { CarOccupancy } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_occupancy_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarOccupancy[];

export const carOccupancySlice = createSlice({
  name: "carOccupancy",
  initialState,
  reducers: {
    updateCarOccupancy: (state, action: PayloadAction<CarOccupancy[]>) => {
      return action.payload;
    },
    resetCarOccupancy: () => {
      return initialState;
    },
  },
});

export const { updateCarOccupancy, resetCarOccupancy } = carOccupancySlice.actions;
export default carOccupancySlice.reducer;
