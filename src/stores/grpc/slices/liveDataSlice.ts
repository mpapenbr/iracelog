import {
  ListLiveEventsResponse,
  LiveEventContainer,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/provider/v1/provider_service_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface LiveData {
  eventData: LiveEventContainer;
  connected: boolean;
}
const initialState = [] as LiveData[];

export const liveDataSlice = createSlice({
  name: "liveData",
  initialState,
  reducers: {
    updateLiveData: (state, action: PayloadAction<ListLiveEventsResponse>) => {
      const ret = action.payload.events.map((e) => ({ eventData: e, connected: false }));
      const currentLiveEvent = state.find((e) => e.connected === true);
      if (currentLiveEvent) {
        const newLiveEvent = ret.find(
          (e) => e.eventData.event?.key === currentLiveEvent.eventData.event?.key,
        );
        if (newLiveEvent) {
          newLiveEvent.connected = true;
        }
      }
      return ret;
    },
    setConnected: (state, action: PayloadAction<string>) => {
      const currentLiveEvent = state.find((e) => e.eventData.event?.key === action.payload);
      if (currentLiveEvent) {
        currentLiveEvent.connected = true;
      }
    },
    unsetConnected: (state, action: PayloadAction<string>) => {
      const currentLiveEvent = state.find((e) => e.eventData.event?.key === action.payload);
      if (currentLiveEvent) {
        currentLiveEvent.connected = false;
      }
    },
  },
});

export const { updateLiveData, setConnected, unsetConnected } = liveDataSlice.actions;
export default liveDataSlice.reducer;
