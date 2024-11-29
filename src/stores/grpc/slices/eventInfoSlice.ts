import { Event, EventSchema } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_pb";
import { Track, TrackSchema } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/track/v1/track_pb";
import { create } from "@bufbuild/protobuf";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface EventInfoState {
  event: Event;
  track: Track;
}
const initialState: EventInfoState = {
  event: { ...create(EventSchema) },
  track: { ...create(TrackSchema) },
};

export const eventInfoSlice = createSlice({
  name: "eventInfo",
  initialState,
  reducers: {
    updateEvent(state, action: PayloadAction<Event>) {
      state.event = action.payload;
    },
    updateTrack(state, action: PayloadAction<Track>) {
      state.track = action.payload;
    },
    resetEventInfo: () => {
      return initialState;
    },
  },
});

export const { updateEvent, updateTrack, resetEventInfo } = eventInfoSlice.actions;
export default eventInfoSlice.reducer;
