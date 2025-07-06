import { createSlice } from "@reduxjs/toolkit";
import { IRaceloggerStatus } from "./types";

const initialState = {} as IRaceloggerStatus;

export const raceloggerStatusSlice = createSlice({
  name: "raceloggerStatus",
  initialState,
  reducers: {
    updateRaceloggerServerAvailable: (state, action) => {
      state.raceloggerServerAvailable = action.payload;
    },
    updateBackendAvailable: (state, action) => {
      state.backendAvailable = action.payload;
    },
    updateBackendCompatible: (state, action) => {
      state.backendCompatible = action.payload;
    },
    updateValidCredentials: (state, action) => {
      state.validCredentials = action.payload;
    },
    updateSimulationRunning: (state, action) => {
      state.simulationRunning = action.payload;
    },
    updateTelemetryAvailable: (state, action) => {
      state.telemetryAvailable = action.payload;
    },
    updateCurrentSessionNum: (state, action) => {
      state.currentSessionNum = action.payload;
    },
    updateRaceSessions: (state, action) => {
      state.raceSessions = action.payload;
    },
    updateRecording: (state, action) => {
      state.recording = action.payload;
    },

    resetSettings: () => {
      return initialState;
    },
  },
});

export const {
  resetSettings,
  updateRaceloggerServerAvailable,
  updateBackendAvailable,
  updateBackendCompatible,
  updateValidCredentials,
  updateSimulationRunning,
  updateTelemetryAvailable,
  updateCurrentSessionNum,
  updateRaceSessions,
  updateRecording,
} = raceloggerStatusSlice.actions;
export default raceloggerStatusSlice.reducer;
