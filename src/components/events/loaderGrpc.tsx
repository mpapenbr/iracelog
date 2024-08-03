import { GetEventRequest } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/event/v1/event_service_pb";
import { CarLaps } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_laps_pb";
import { CarOccupancy } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_occupancy_pb";
import { CarPit } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_pit_pb";
import { CarStint } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";
import { RaceGraph } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/racegraph_pb";
import { SnapshotData } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/snapshot_data_pb";
import {
  CarClass,
  CarContainer,
  CarEntry,
  CarInfo,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/car/v1/car_pb";
import {
  Event,
  ReplayInfo,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/event/v1/event_pb";
import {
  Car,
  MessageContainer,
  Session,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/racestate/v1/racestate_pb";
import { Speedmap } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/speedmap/v1/speedmap_pb";
import { AnalysisService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/analysis/v1/analysis_service_connect";
import { EventService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/event/v1/event_service_connect";
import { TrackService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/track/v1/track_service_connect";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { globalWamp } from "../../commons/globals";
import { useAppDispatch } from "../../stores";
import {
  updateFromCarContainer,
  updateFromCarOccupancy,
} from "../../stores/grpc/slices/availableCarsSlice";
import { updateCarClasses } from "../../stores/grpc/slices/carClassesSlice";
import { updateCarEntries } from "../../stores/grpc/slices/carEntrySlice";
import { updateCarInfo } from "../../stores/grpc/slices/carInfoSlice";
import { initialCarLaps } from "../../stores/grpc/slices/carLapsSlice";
import { updateForCarNumFromDriverData } from "../../stores/grpc/slices/carNumByIdxSlice";
import { updateCarOccupancy } from "../../stores/grpc/slices/carOccupancySlice";
import { updateCarPits } from "../../stores/grpc/slices/carPitsSlice";
import { updateCarStints } from "../../stores/grpc/slices/carStintsSlice";
import { updateClassification } from "../../stores/grpc/slices/classificationSlice";
import { updateEvent, updateTrack } from "../../stores/grpc/slices/eventInfoSlice";
import { initSnapshotData } from "../../stores/grpc/slices/eventSnapshotData";
import { loadedMessages } from "../../stores/grpc/slices/messagesSlice";
import { initialRaceGraph } from "../../stores/grpc/slices/raceGraphSlice";
import { updateRaceOrder } from "../../stores/grpc/slices/raceOrderSlice";
import {
  updateRecordstamp,
  updateRefTimeOfDay,
  updateSession,
} from "../../stores/grpc/slices/sessionSlice";
import { updateSpeedmap } from "../../stores/grpc/slices/speedmapSlice";
import {
  updateReplayInfo,
  updateStintRankingsRange,
} from "../../stores/grpc/slices/userSettingsSlice";
import { useClient } from "../../utils/useClient";
import { resetData, resetUI } from "./resetState";

// import { initialReplaySettings } from "../../stores/ui/reducer";

interface MyProps {
  eventKey?: string;
  onFinished: (success: boolean) => void;
}
export const LoaderPageGrpc: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const config = globalWamp.backendConfig;
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [task, setTasks] = useState("");

  const cbEventClient = useClient(EventService);
  const cbTrackClient = useClient(TrackService);
  const cbAnalysisClient = useClient(AnalysisService);

  useEffect(() => {
    cbEventClient.getEvent(
      GetEventRequest.fromJson({
        eventSelector: { key: props.eventKey! },
      }),
      (err, res) => {
        if (err != undefined) {
          console.log(err);
          props.onFinished(false);
          return;
        }
        resetData(dispatch);
        resetUI(dispatch);
        console.log("Event fetched", res);
        dispatch(updateEvent(res.event as Event));
        dispatch(updateTrack(res.track!));
        dispatch(updateReplayInfo(res.event?.replayInfo as ReplayInfo));
        dispatch(updateStintRankingsRange(res.event?.replayInfo as ReplayInfo));
        // updates form CarContainer
        dispatch(updateFromCarContainer(res.car as CarContainer));
        dispatch(updateFromCarOccupancy(res.analysis?.carOccupancies as CarOccupancy[]));
        dispatch(updateForCarNumFromDriverData(res.car?.entries as CarEntry[]));
        dispatch(updateCarClasses(res.car?.carClasses as CarClass[]));
        dispatch(updateCarEntries(res.car?.entries as CarEntry[]));
        dispatch(updateCarInfo(res.car?.cars as CarInfo[]));
        // updates form Analysis
        dispatch(updateCarOccupancy(res.analysis?.carOccupancies as CarOccupancy[]));
        dispatch(updateRaceOrder(res.analysis?.raceOrder!));
        dispatch(updateCarStints(res.analysis?.carStints as CarStint[]));
        dispatch(updateCarPits(res.analysis?.carPits as CarPit[]));
        dispatch(initialCarLaps(res.analysis?.carLaps as CarLaps[]));
        dispatch(initialRaceGraph(res.analysis?.raceGraph as RaceGraph[]));
        // updates from RaceState
        dispatch(updateSession(res.state?.session as Session));
        dispatch(updateRefTimeOfDay(res.state?.session as Session));
        const x =
          res.event!.replayInfo!.minTimestamp!.toDate().getTime() -
          res.event!.replayInfo!.minSessionTime * 1000;
        dispatch(updateRecordstamp(new Date(x)));

        dispatch(updateClassification(res.state?.cars as Car[]));
        dispatch(loadedMessages(res.state?.messages as MessageContainer[]));
        // updates from Speedmap
        dispatch(updateSpeedmap(res.speedmap as Speedmap));
        // updates from Snapshots
        dispatch(initSnapshotData(res.snapshots as SnapshotData[]));
      },
    );

    props.onFinished(true);
  }, [loadTrigger]);

  return <>{task}</>;
};
