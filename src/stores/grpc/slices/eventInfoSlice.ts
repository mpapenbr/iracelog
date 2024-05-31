import { Event as EventMsg } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_pb";
import { Track as TrackMsg } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/track/v1/track_pb";
import { Event } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/event/v1/event_pb";
import { Track } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/track/v1/track_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface EventInfoState {
  event: Event;
  track: Track;
}
const initialState: EventInfoState = { event: { ...new EventMsg() }, track: { ...new TrackMsg() } };

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
