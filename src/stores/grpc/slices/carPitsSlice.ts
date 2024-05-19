import { CarPit } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_pit_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as CarPit[];

export const carPitsSlice = createSlice({
  name: "carPits",
  initialState,
  reducers: {
    updateCarPits: (state, action: PayloadAction<CarPit[]>) => {
      return action.payload;
    },
    resetCarPits: () => {
      return initialState;
    },
  },
});

export const { updateCarPits, resetCarPits } = carPitsSlice.actions;
export default carPitsSlice.reducer;
