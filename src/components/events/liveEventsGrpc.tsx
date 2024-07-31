import { ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, List, Row } from "antd";

import {
  AnalysisComponent,
  LiveAnalysisSelRequest,
  LiveDriverDataRequest,
  LiveRaceStateRequest,
  LiveSnapshotDataRequest,
  LiveSpeedmapRequest,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/livedata/v1/live_service_pb";
import { ListLiveEventsResponse } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/provider/v1/provider_service_pb";

import { Event } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/event/v1/event_pb";
import {
  Car,
  Session,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/racestate/v1/racestate_pb";
import { Track } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/track/v1/track_pb";
import { LiveDataService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/livedata/v1/live_service_connect";
import { ProviderService } from "@buf/mpapenbr_iracelog.connectrpc_es/iracelog/provider/v1/provider_service_connect";
import { ConnectError } from "@connectrpc/connect";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StreamContainer, closeStreams, globalWamp } from "../../commons/globals";
import { useAppDispatch, useAppSelector } from "../../stores";
import { updateFromDriverData } from "../../stores/grpc/slices/availableCarsSlice";
import { updateClassification } from "../../stores/grpc/slices/classificationSlice";
import { updateEvent, updateTrack } from "../../stores/grpc/slices/eventInfoSlice";
import { updateRecordstamp, updateSession } from "../../stores/grpc/slices/sessionSlice";

import { CarLaps } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_laps_pb";
import { CarOccupancy } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_occupancy_pb";
import { CarPit } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_pit_pb";
import { CarStint } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";
import { RaceGraph } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/racegraph_pb";
import { SnapshotData } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/snapshot_data_pb";
import { Speedmap } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/speedmap/v1/speedmap_pb";
import { updateCarClasses } from "../../stores/grpc/slices/carClassesSlice";
import { updateCarEntries } from "../../stores/grpc/slices/carEntrySlice";
import { updateCarInfo } from "../../stores/grpc/slices/carInfoSlice";
import { initialCarLaps, updateCarLaps } from "../../stores/grpc/slices/carLapsSlice";
import { updateForCarNumFromDriverData } from "../../stores/grpc/slices/carNumByIdxSlice";
import { updateCarOccupancy } from "../../stores/grpc/slices/carOccupancySlice";
import { updateCarPits } from "../../stores/grpc/slices/carPitsSlice";
import { updateCarStints } from "../../stores/grpc/slices/carStintsSlice";
import { initSnapshotData, updateSnapshotData } from "../../stores/grpc/slices/eventSnapshotData";
import {
  LiveData,
  setConnected,
  unsetConnected,
  updateLiveData,
} from "../../stores/grpc/slices/liveDataSlice";
import { updateMessages } from "../../stores/grpc/slices/messagesSlice";
import { initialRaceGraph, updateRaceGraph } from "../../stores/grpc/slices/raceGraphSlice";
import { updateRaceOrder } from "../../stores/grpc/slices/raceOrderSlice";
import { updateSpeedmap } from "../../stores/grpc/slices/speedmapSlice";
import { useClient } from "../../utils/useClient";
import { resetData, resetUI } from "./resetState";

export const LiveEvents: React.FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const livedata = useAppSelector((state) => state.liveData);

  const [loadTrigger, setLoadTrigger] = useState(0);
  const cbProviderClient = useClient(ProviderService);
  const cbLiveDataClient = useClient(LiveDataService);
  const config = globalWamp.backendConfig;

  useEffect(() => {
    onReloadRequested();
  }, [loadTrigger]);

  const closeCurrentConnections = () => {
    closeStreams(globalWamp.streamContainer);
  };
  const connectToLiveData = (eventKey: string) => {
    console.log("TBD: connecting to event now");
    var analysisCount = 0;
    var stateCount = 0;
    var driverDataCount = 0;
    var speedmapCount = 0;
    var snapshotDataCount = 0;
    closeCurrentConnections();
    resetData(dispatch);
    resetUI(dispatch);
    const liveAnalysisCancel = cbLiveDataClient.liveAnalysisSel(
      LiveAnalysisSelRequest.fromJson({
        event: { key: eventKey },
        selector: {
          components: [
            AnalysisComponent.CAR_OCCUPANCIES,
            AnalysisComponent.RACE_ORDER,
            AnalysisComponent.CAR_LAPS,
            AnalysisComponent.CAR_STINTS,
            AnalysisComponent.CAR_PITS,
            AnalysisComponent.RACE_GRAPH,
          ],
          carLapsNumTail: 1,
          raceGraphNumTail: 1,
        },
      }),
      (res) => {
        // const x: LiveAnalysisSelResponse = res;

        analysisCount++;
        // console.log(`analysis msg: ${analysisCount}: ${res.toJsonString().length}`);
        const plain = { ...res };
        dispatch(updateCarOccupancy(res.carOccupancies as CarOccupancy[]));
        dispatch(updateRaceOrder(res.raceOrder!));
        dispatch(updateCarStints(res.carStints as CarStint[]));
        dispatch(updateCarPits(res.carPits as CarPit[]));

        if (analysisCount === 1) {
          dispatch(initialCarLaps(res.carLaps as CarLaps[]));
          dispatch(initialRaceGraph(res.raceGraph as RaceGraph[]));
          dispatch(initSnapshotData(res.snapshots as SnapshotData[]));
        } else {
          dispatch(updateCarLaps(res.carLaps as CarLaps[]));
          dispatch(updateRaceGraph(res.raceGraph as RaceGraph[]));
        }
      },
      (err) => {
        if (err != undefined) console.log(err);
      },
    );
    const liveStateCancel = cbLiveDataClient.liveRaceState(
      LiveRaceStateRequest.fromJson({
        event: { key: eventKey },
      }),
      (res) => {
        stateCount++;
        // console.log(`state msg: ${stateCount}: ${res.toJsonString().length}`);
        dispatch(updateSession({ ...res.session } as Session));
        dispatch(updateRecordstamp(res.timestamp!.toDate()));

        const pureCarJsonObj = res.cars.map((c) => ({ ...c }));
        dispatch(updateClassification(pureCarJsonObj as Car[]));

        const pureMessageJsonObj = res.messages.map((c) => ({ ...c }));
        const pureJson = { ...res };
        dispatch(updateMessages(pureJson));
      },
      (err) => {
        if (err != undefined) console.log(err);
      },
    );
    const liveDriverDataCancel = cbLiveDataClient.liveDriverData(
      LiveDriverDataRequest.fromJson({
        event: { key: eventKey },
      }),
      (res) => {
        driverDataCount++;
        console.log(`driver data msg: ${driverDataCount}: ${res.toJsonString().length}`);
        const plain = { ...res };
        dispatch(updateForCarNumFromDriverData(plain.entries));
        dispatch(updateFromDriverData(plain));
        dispatch(updateCarClasses(plain.carClasses));
        dispatch(updateCarEntries(plain.entries));
        dispatch(updateCarInfo(plain.cars));
      },
      (err) => {
        if (err != undefined) console.log(err);
      },
    );
    const speedmapDataCancel = cbLiveDataClient.liveSpeedmap(
      LiveSpeedmapRequest.fromJson({
        event: { key: eventKey },
      }),
      (res) => {
        speedmapCount++;
        console.log(`speedmap data msg: ${speedmapCount}: ${res.toJsonString().length}`);
        const plain = { ...res };
        dispatch(updateSpeedmap(res.speedmap as Speedmap));
      },
      (err) => {
        if (err != undefined) console.log(err);
      },
    );
    const snapshotDataCancel = cbLiveDataClient.liveSnapshotData(
      LiveSnapshotDataRequest.fromJson({
        event: { key: eventKey },
      }),
      (res) => {
        snapshotDataCount++;
        console.log(`snapshot data msg: ${snapshotDataCount}: ${res.toJsonString().length}`);
        const plain = { ...res };
        dispatch(updateSnapshotData(res.snapshotData as SnapshotData));
      },
      (err) => {
        if (err != undefined) console.log(err);
      },
    );

    const c: StreamContainer = {
      analysis: liveAnalysisCancel,
      live: liveStateCancel,
      driverData: liveDriverDataCancel,
      speedmap: speedmapDataCancel,
      snapshot: snapshotDataCancel,
    };
    globalWamp.streamContainer = c;
  };

  const openLiveConnection = (e: React.MouseEvent) => {
    const id = (e.currentTarget as HTMLInputElement).value as string;

    connectToLiveData(id);
    dispatch(setConnected(id));
    const liveEvent = livedata.find((e) => e.eventData.event?.key === id);
    if (liveEvent) {
      dispatch(updateEvent({ ...liveEvent.eventData.event } as Event));
      dispatch(updateTrack({ ...liveEvent.eventData.track } as Track));
    }

    globalWamp.currentLiveId = id;

    // navigate("/analysis/" + id, { state: { id: id } });

    //TODO: reactivate
    // navigate("/analysis/" + id);

    // setTimeout(() => setLoading(false), 2000);
  };

  const closeLiveConnection = (e: React.MouseEvent) => {
    const id = (e.currentTarget as HTMLInputElement).value as string;

    closeCurrentConnections();
    dispatch(unsetConnected(id));
  };

  const onReloadRequested = async () => {
    console.log("fetching current live data providers");

    cbProviderClient.listLiveEvents(
      {},
      (err: ConnectError | undefined, res: ListLiveEventsResponse) => {
        if (!err) {
          dispatch(updateLiveData({ ...res }));
        } else {
          console.log("error fetching live events: " + err.message);
        }
        // add res to events

        // events.concat(res.clone());
      },
    );
  };
  const redirectAnalysis = (e: React.MouseEvent) => {
    console.log("settings check");
    const id = (e.currentTarget as HTMLInputElement).value as string;
    navigate("/analysis/" + id);
  };
  const buttons = (item: LiveData) => {
    if (!item.connected) {
      return [
        <Button
          key={"bt-live" + item.eventData.event?.key}
          value={item.eventData.event?.key}
          type="default"
          onClick={openLiveConnection}
        >
          Connect
        </Button>,
      ];
    } else {
      return [
        <Button
          key={"bt-live" + item.eventData.event?.key}
          value={item.eventData.event?.key}
          type="default"
          onClick={redirectAnalysis}
        >
          To Analysis
        </Button>,
        <Button
          key={"bt-live" + item.eventData.event?.key}
          value={item.eventData.event?.key}
          type="default"
          onClick={closeLiveConnection}
        >
          Disconnect
        </Button>,
      ];
    }
  };
  return (
    <List
      header={
        <Row justify="space-between">
          <Col span={12}>
            <h3>Live data</h3>
          </Col>
          <Col offset={8}>
            <Button icon={<ReloadOutlined />} onClick={onReloadRequested} />
          </Col>
        </Row>
      }
      dataSource={livedata}
      renderItem={(item: LiveData) => (
        <List.Item actions={buttons(item)}>
          <Descriptions size="small" column={2} colon={false}>
            <Descriptions.Item span={item.eventData.event?.description ? 1 : 2}>
              <b>{item.eventData.event?.name}</b>
            </Descriptions.Item>
            {item.eventData.event?.description ? (
              <Descriptions.Item>
                <div className="iracelog-event-description">
                  {item.eventData.event?.description}
                </div>
              </Descriptions.Item>
            ) : (
              <></>
            )}
            <Descriptions.Item span={2}>
              <div className="iracelog-event-description">{item.eventData.track?.name}</div>
              {/* {new Date(item.recordDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })} */}
            </Descriptions.Item>
          </Descriptions>
        </List.Item>
      )}
    />
  );
};
