import { Session as SessionMsg } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_pb";
import { Session } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/racestate/v1/racestate_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const defaultSession = (): Session => {
  return new SessionMsg({});
};
interface SessionState {
  session: Session;
  recordDate: Date;
  refTimeOfDay: number; // calculated time of day of the session start
}
const initialState = { session: defaultSession(), recordDate: new Date() } as SessionState;

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSession(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      // state.recordDate = action.payload.timestamp?.toDate()
    },
    updateRefTimeOfDay(state, action: PayloadAction<Session>) {
      if (action.payload.sessionTime > action.payload.timeOfDay) {
        state.refTimeOfDay = action.payload.timeOfDay + 86400 - action.payload.sessionTime;
      } else {
        state.refTimeOfDay = action.payload.timeOfDay - action.payload.sessionTime;
      }
    },
    updateRecordstamp(state, action: PayloadAction<Date>) {
      state.recordDate = action.payload;
      // state.recordDate = action.payload.timestamp?.toDate()
    },
    resetSession: () => {
      return initialState;
    },
  },
});

export const { updateSession, updateRecordstamp, updateRefTimeOfDay, resetSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;
