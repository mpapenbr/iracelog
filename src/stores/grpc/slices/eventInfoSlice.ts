import { Event as EventMsg } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/event/v1/event_pb";
import { Track as TrackMsg } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/track/v1/track_pb";
import { Event } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/event/v1/event_pb";
import { Track } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/track/v1/track_pb";
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
