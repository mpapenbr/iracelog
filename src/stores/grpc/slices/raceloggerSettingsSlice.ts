import { createSlice } from "@reduxjs/toolkit";
import { IRaceloggerSettings } from "./types";

const initialState = {
  url: "http://localhost:8135",
} as IRaceloggerSettings;

export const raceloggerSettingsSlice = createSlice({
  name: "raceloggerSettings",
  initialState,
  reducers: {
    resetSettings: () => {
      return initialState;
    },
  },
});

export const { resetSettings } = raceloggerSettingsSlice.actions;
export default raceloggerSettingsSlice.reducer;
