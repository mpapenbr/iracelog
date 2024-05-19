import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as string[];

export const raceOrderSlice = createSlice({
  name: "raceOrder",
  initialState,
  reducers: {
    updateRaceOrder: (state, action: PayloadAction<string[]>) => {
      return action.payload;
    },
    resetRaceOrder: () => {
      return initialState;
    },
  },
});

export const { updateRaceOrder, resetRaceOrder } = raceOrderSlice.actions;
export default raceOrderSlice.reducer;
