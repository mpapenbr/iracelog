//import { LiveDriverDataResponse } from "@buf/mpapenbr_testrepo.bufbuild_es/testrepo/livedata/v1/live_service_pb";
import {
  LiveAnalysisSelResponse,
  LiveDriverDataResponse,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/livedata/v1/live_service_pb";
import actionCreatorFactory from "typescript-fsa";
const actionCreator = actionCreatorFactory("CAR_DATA");
export const updateGrpcLiveDriverData = actionCreator<LiveDriverDataResponse>(
  "UPDATE_CAR_LIVE_DRIVER_DATA",
);
export const updateGrpcLiveAnalysisData = actionCreator<LiveAnalysisSelResponse>(
  "UPDATE_CAR_LIVE_ANALYSIS",
);
