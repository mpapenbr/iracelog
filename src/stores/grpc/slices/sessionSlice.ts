import { Session as SessionMsg } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/racestate/v1/racestate_pb";
import { Session } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/racestate/v1/racestate_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const defaultSession = (): Session => {
  return new SessionMsg({});
};
interface SessionState {
  session: Session;
}
const initialState = { ...defaultSession() };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSession(state, action: PayloadAction<Session>) {
      return action.payload;
    },
    resetSession: () => {
      return initialState;
    },
  },
});

export const { updateSession, resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;
