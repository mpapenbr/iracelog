import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

// new grpc stuff starts here
import { useDispatch, useSelector } from "react-redux";
import { availableCarsSlice } from "./grpc/slices/availableCarsSlice";
import { carClassesSlice } from "./grpc/slices/carClassesSlice";
import { carEntrySlice } from "./grpc/slices/carEntrySlice";
import { carInfoSlice } from "./grpc/slices/carInfoSlice";
import { carLapsSlice } from "./grpc/slices/carLapsSlice";
import { byIdxLookupSlice } from "./grpc/slices/carNumByIdxSlice";
import { carOccupancySlice } from "./grpc/slices/carOccupancySlice";
import { carPitsSlice } from "./grpc/slices/carPitsSlice";
import { carStintsSlice } from "./grpc/slices/carStintsSlice";
import { classificationSlice } from "./grpc/slices/classificationSlice";
import { eventDataSlice } from "./grpc/slices/eventDataSlice";
import { eventInfoSlice } from "./grpc/slices/eventInfoSlice";
import { eventSnapshotDataSlice } from "./grpc/slices/eventSnapshotData";
import { liveDataSlice } from "./grpc/slices/liveDataSlice";
import { infoMessagesSlice } from "./grpc/slices/messagesSlice";
import { raceGraphSlice } from "./grpc/slices/raceGraphSlice";
import { raceOrderSlice } from "./grpc/slices/raceOrderSlice";
import { sessionSlice } from "./grpc/slices/sessionSlice";
import { speedmapSlice } from "./grpc/slices/speedmapSlice";
import { combined } from "./grpc/slices/userSettingsSlice";

export interface ApplicationState {}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    // raceData: raceDataReducers, // this is new place for everything concerning the race data of a single event
    // userSettings: userSettingsReducer, // this is the new place for user settings
    // speedmap: speedmapReducers,
    // carData: carDataReducers,
    // session: SessionReducer,
    // classification: ClassificationReducer,
    // carStuff: CurrentCarOccReducer,
    // dummy: DummyReducer,
  });

export const store = configureStore({
  reducer: {
    // raceData: raceDataReducers,
    // userSettings: userSettingsReducer,
    // speedmap: speedmapReducers,
    // carData: carDataReducers,
    eventInfo: eventInfoSlice.reducer,
    session: sessionSlice.reducer,
    availableCars: availableCarsSlice.reducer,
    classification: classificationSlice.reducer,
    carOccupancies: carOccupancySlice.reducer,
    carInfos: carInfoSlice.reducer,
    carEntries: carEntrySlice.reducer,
    carLaps: carLapsSlice.reducer,
    carPits: carPitsSlice.reducer,
    carStints: carStintsSlice.reducer,
    raceOrder: raceOrderSlice.reducer,
    raceGraph: raceGraphSlice.reducer,
    speedmap: speedmapSlice.reducer,
    eventSnapshots: eventSnapshotDataSlice.reducer,
    infoMessages: infoMessagesSlice.reducer,

    carClasses: carClassesSlice.reducer,
    userSettings: combined,
    liveData: liveDataSlice.reducer,
    eventData: eventDataSlice.reducer,
    byIdxLookup: byIdxLookupSlice.reducer,
    // classification: ClassificationReducer,
    // carStuff: CurrentCarOccReducer,
    // dummy: DummyReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
