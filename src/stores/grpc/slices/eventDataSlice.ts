import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface EventData {
  id: number;
  key: string;
  name: string;
  description: string;
  eventTime: Date;
  trackName: string;
}
export interface EditEventData {
  id: number;
  name: string;
  description: string;
}
const initialState = [] as EventListData[];
export interface EventListData {
  event: EventData;
  loaded: boolean;
}

export const eventDataSlice = createSlice({
  name: "eventData",
  initialState,
  reducers: {
    updateEventData: (state, action: PayloadAction<EventData[]>) => {
      const newEvents = action.payload.map((e) => ({ event: e, loaded: false }));

      // Merge with existing events, avoiding duplicates
      const existingIds = state.map((item) => item.event.id);
      const uniqueNewEvents = newEvents.filter((event) => !existingIds.includes(event.event.id));
      const x = [...state, ...uniqueNewEvents];
      console.log("Merged events:", x);
      return [...state, ...uniqueNewEvents];
    },
    updateEvent: (state, action: PayloadAction<EditEventData>) => {
      const index = state.findIndex((e) => e.event.id === action.payload.id);
      if (index !== -1) {
        state[index].event.name = action.payload.name;
        state[index].event.description = action.payload.description;
      }
    },
    removeEvent: (state, action: PayloadAction<number>) => {
      return state.filter((e) => e.event.id !== action.payload);
    },

    resetEventData: () => {
      return initialState;
    },
  },
});

export const { updateEventData, removeEvent, resetEventData, updateEvent } = eventDataSlice.actions;
export default eventDataSlice.reducer;
