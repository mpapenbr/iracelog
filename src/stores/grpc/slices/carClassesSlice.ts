import { CarClass } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/car/v1/car_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarClass[];

export const carClassesSlice = createSlice({
  name: "carClasses",
  initialState,
  reducers: {
    updateCarClasses: (state, action: PayloadAction<CarClass[]>) => {
      return action.payload.sort((a, b) => a.name.localeCompare(b.name));
    },
    resetCarClasses: () => {
      return initialState;
    },
  },
});

export const { updateCarClasses, resetCarClasses } = carClassesSlice.actions;
export default carClassesSlice.reducer;
