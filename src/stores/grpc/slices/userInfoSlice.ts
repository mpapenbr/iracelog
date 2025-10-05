import {
  UserInfo,
  UserInfoSchema,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/user/v1/user_pb";
import { create } from "@bufbuild/protobuf";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const defaultUserInfo = (): UserInfo => {
  return create(UserInfoSchema);
};
interface UserInfoState {
  loggedIn: boolean;
  info: UserInfo;
}
const initialState = { loggedIn: false, info: create(UserInfoSchema) } as UserInfoState;

export const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.info = action.payload;
      state.loggedIn = true;
    },

    resetUserInfo: () => {
      return initialState;
    },
  },
});

export const { updateUserInfo, resetUserInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
