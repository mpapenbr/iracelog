import { combineReducers } from "redux";

export interface ApplicationState {}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () => combineReducers({});

export function* rootSaga() {
  // yield all([fork(raceSaga), fork(userSaga)]);
  // yield all([fork(userSaga)]);
}
