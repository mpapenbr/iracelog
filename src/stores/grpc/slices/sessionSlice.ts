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
    updateRecordstamp(state, action: PayloadAction<Date>) {
      state.recordDate = action.payload;
      // state.recordDate = action.payload.timestamp?.toDate()
    },
    resetSession: () => {
      return initialState;
    },
  },
});

export const { updateSession, updateRecordstamp, resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;
