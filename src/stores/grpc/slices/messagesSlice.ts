import { LiveRaceStateResponse } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/livedata/v1/live_service_pb";
import {
  Message,
  MessageContainer,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/racestate/v1/racestate_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface MessageExt {
  timestamp: Date;
  sessionTime: number;
  message: Message;
}
interface MessagesState {
  messages: MessageExt[];
}
const initialState = { messages: [] } as MessagesState;

export const infoMessagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    updateMessages: (state, action: PayloadAction<LiveRaceStateResponse>) => {
      if (action.payload.messages.length > 0) {
        // console.log("updateMessages", action.payload.messages);
        const newMessages = action.payload.messages.map((m) => ({
          timestamp: action.payload.timestamp?.toDate(),
          sessionTime: action.payload.session?.sessionTime!,
          message: m,
        }));
        const x = [...state.messages, ...newMessages];
        state.messages = x;
      }
    },
    loadedMessages: (state, action: PayloadAction<MessageContainer[]>) => {
      if (action.payload.length > 0) {
        // console.log("updateMessages", action.payload.messages);
        const newMessages = action.payload.map((m) => ({
          timestamp: m.timestamp?.toDate(),
          sessionTime: m.sessionTime,
          message: m.message!,
        }));
        const x = [...state.messages, ...newMessages];
        state.messages = x;
      }
    },
    resetMessages: () => {
      return initialState;
    },
  },
});

export const { updateMessages, loadedMessages, resetMessages } = infoMessagesSlice.actions;
export default infoMessagesSlice.reducer;
