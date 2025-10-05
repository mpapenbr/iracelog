import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { IServerSettings } from "./types";

const initialState = { supportsLogins: false } as IServerSettings;

export const serverSettingsSlice = createSlice({
  name: "serverSettings",
  initialState,
  reducers: {
    updateLoginSupport: (state, action: PayloadAction<boolean>) => {
      state.supportsLogins = action.payload;
    },
    resetServerSettings: () => {
      return initialState;
    },
  },
});

export const { updateLoginSupport, resetServerSettings } = serverSettingsSlice.actions;
export default serverSettingsSlice.reducer;
