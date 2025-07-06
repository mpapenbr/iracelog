import { createSlice } from "@reduxjs/toolkit";
import { loadRaceloggerSettings, saveRaceloggerSettings } from "../../localStorage";
import { IRaceloggerSettings } from "./types";

const initialState = {
  url: "http://localhost:8135",
} as IRaceloggerSettings;

const useSettings: IRaceloggerSettings = {
  ...initialState,
  ...loadRaceloggerSettings(),
};
export const raceloggerSettingsSlice = createSlice({
  name: "raceloggerSettings",
  initialState: useSettings,
  reducers: {
    resetSettings: () => {
      saveRaceloggerSettings(initialState);
      return initialState;
    },
    updateAddress: (state, action) => {
      state.url = action.payload;
      saveRaceloggerSettings(state);
    },
  },
});

export const { resetSettings, updateAddress } = raceloggerSettingsSlice.actions;
export default raceloggerSettingsSlice.reducer;
