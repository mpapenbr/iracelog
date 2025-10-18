import { Event } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_pb";
import { GetLatestEventsResponse } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface EventListData {
  event: Event;
  loaded: boolean;
}
const initialState = [] as EventListData[];

export const eventDataSlice = createSlice({
  name: "eventData",
  initialState,
  reducers: {
    updateEventData: (state, action: PayloadAction<GetLatestEventsResponse>) => {
      const ret = action.payload.events.map((e) => ({ event: e, loaded: false }));
      const currentLiveEvent = state.find((e) => e.loaded === true);
      return ret;
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.findIndex((e) => e.event.id === action.payload.id);
      if (index !== -1) {
        state[index] = { event: action.payload, loaded: false };
      }
    },
    resetEventData: () => {
      return initialState;
    },
  },
});

export const { updateEventData, resetEventData, updateEvent } = eventDataSlice.actions;
export default eventDataSlice.reducer;
