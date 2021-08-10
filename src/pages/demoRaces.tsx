import { ReloadOutlined } from "@ant-design/icons";
import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import {
  defaultProcessRaceStateData,
  ICarInfo,
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IProcessRaceStateData,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Button, Col, List, Modal, Row } from "antd";
import autobahn, { Session } from "autobahn";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../commons/globals";
import { API_CROSSBAR_URL } from "../constants";
import { distributeChanges } from "../processor/processData";
import { ReplayDataHolder } from "../processor/ReplayDataHolder";
import { updateAvailableStandingsColumns } from "../stores/basedata/actions";
import {
  updateAvailableCarClasses,
  updateAvailableCars,
  updateCarInfo,
  updateCarLaps,
  updateCarPits,
  updateCarStints,
  updateClassification,
  updateEventInfo,
  updateInfoMessages,
  updateRaceGraph,
  updateSessionInfo,
  updateTrackInfo,
} from "../stores/racedata/actions";
import { ICarBaseData, ICarClass, ITrackInfo } from "../stores/racedata/types";
import {
  circleOfDoomSettings,
  classificationSettings,
  driverLapsSettings,
  driverStintsSettings,
  globalSettings,
  messagesSettings,
  pitstopsSettings,
  raceGraphRelativeSettings,
  raceGraphSettings,
  racePositionsSettings,
  replaySettings,
  stintsSettings,
  stintSummarySettings,
} from "../stores/ui/actions";
import { defaultStateData, initialReplaySettings } from "../stores/ui/reducer";
import { connectedToServer, reset, setManifests, updateManifests } from "../stores/wamp/actions";
import { postProcessManifest } from "../stores/wamp/reducer";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const DemoRaces: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Loading data....");
  const [livedata, setLivedata] = useState([] as any[]);
  const [events, setEvents] = useState([] as any[]);

  useEffect(() => {
    onReloadRequested();
    onLoadEvents();
  }, [loadTrigger]);

  const onLoadForReplayButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const arg = e.currentTarget.value;
    // readData(arg, dispatch, doInfo);
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = async (s: Session) => {
      setLoading(true);
      const eventInfo = (await s.call("racelog.archive.event_info", [arg])) as any;
      console.log(eventInfo);
      dispatch(reset());
      resetUi();
      const settings = {
        ...initialReplaySettings,
        minTimestamp: eventInfo.data.replayInfo.minTimestamp,
        currentSessionTime: eventInfo.data.replayInfo.minSessionTime,
        minSessionTime: eventInfo.data.replayInfo.minSessionTime,
        maxSessionTime: eventInfo.data.replayInfo.maxSessionTime,
        enabled: true,
        eventKey: eventInfo.eventKey,
        eventId: eventInfo.id,
      };
      dispatch(replaySettings(settings));
      dispatch(updateEventInfo(eventInfo.data.info));

      const trackInfo = (await s.call("racelog.get_track_info", [eventInfo.data.info.trackId])) as ITrackInfo;
      dispatch(updateTrackInfo(trackInfo));
      // const mData = JSON.parse(manifestData);
      const data = (await s.call("racelog.analysis.archive", [eventInfo.eventKey])) as any;

      doDistribute(defaultProcessRaceStateData, data);
      dispatch(updateManifests(eventInfo.data.manifests));
      // conn.close();
      const rh = new ReplayDataHolder(s, settings);
      globalWamp.replayHolder = rh;
      globalWamp.currentLiveId = undefined;

      setLoading(false);
      history.push("/analysis");
    };

    conn.open();
    // setTimeout(() => setLoading(false), 2000);
  };
  const onChangeSession = (message: IMessage) => {
    // console.log(message);
    dispatch(updateSessionInfo(message));
  };
  const onChangeClassification = (message: IMessage) => {
    // console.log(message);
    dispatch(updateClassification(message));
  };

  const onChangeInfoMessages = (data: IMessage[]) => {
    console.log("onChangeInfoMessages: " + data.length);
    dispatch(updateInfoMessages(data));
  };
  const onChangedAvailableCars = (data: ICarBaseData[]) => {
    console.log("onChangedAvailableCars: " + data.length);
    dispatch(updateAvailableCars(data));
  };
  const onChangedAvailableCarClasses = (data: ICarClass[]) => {
    console.log("onChangedAvailableCarClasses: " + data.length);
    dispatch(updateAvailableCarClasses(data));
  };

  const onChangeCarInfos = (data: ICarInfo[]) => {
    // console.log(message);
    dispatch(updateCarInfo(data));
  };
  const onChangeRaceGraph = (data: IRaceGraph[]) => {
    console.log("onChangeRaceGraph: " + data.length);
    dispatch(updateRaceGraph(data));
  };
  const onChangeCarLaps = (data: ICarLaps[]) => {
    // console.log(message);
    dispatch(updateCarLaps(data));
  };
  const onChangeCarStints = (data: ICarStintInfo[]) => {
    // console.log("onChangeCarStints:" + data.length);
    dispatch(updateCarStints(data));
  };
  const onChangeCarPits = (data: ICarPitInfo[]) => {
    // console.log(message);
    // console.log("onChangeCarPits:" + data.length);
    dispatch(updateCarPits(data));
  };

  const doDistribute = (currentData: IProcessRaceStateData, newData: IProcessRaceStateData) => {
    distributeChanges({
      currentData: currentData,
      newData: newData,
      onChangedSession: onChangeSession,
      onChangedClassification: onChangeClassification,
      onChangedAvailableCars: onChangedAvailableCars,
      onChangedAvailableCarClasses: onChangedAvailableCarClasses,
      onChangedRaceGraph: onChangeRaceGraph,
      onChangedCarInfos: onChangeCarInfos,
      onChangedCarLaps: onChangeCarLaps,
      onChangedCarStints: onChangeCarStints,
      onChangedCarPits: onChangeCarPits,
      onChangedInfoMessages: onChangeInfoMessages,
    });
  };

  const connectToLiveData = (id: string) => {
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });

    conn.onopen = (s: Session) => {
      s.call("racelog.analysis.live", [id]).then((data: any) => {
        console.log(data); // we  will always get an array here (due to WAMP)
        // dispatch(updateManifests(data.manifests)); // these are the "small" manifests
        const manifests = postProcessManifest(data.manifests);
        dispatch(setManifests(manifests));
        globalWamp.processor = new BulkProcessor(manifests, data.processedData);

        doDistribute(defaultProcessRaceStateData, data.processedData);
        globalWamp.currentData = data.processedData;
      });
      dispatch(connectedToServer());
      // TODO: maybe combine this with above call
      s.call("racelog.get_event_info", [id]).then(async (data: any) => {
        console.log(data);
        dispatch(updateEventInfo(data[0]));
        const trackInfo = (await s.call("racelog.get_track_info", [data[0].trackId])) as ITrackInfo;
        dispatch(updateTrackInfo(trackInfo));
      });
      s.subscribe(sprintf("racelog.state.%s", id), (data) => {
        const theProc = globalWamp.processor;
        // important, otherwise we don't detect changes on carLaps,carStints,.... (all those Array.from(...) attrs of BulkProcessor)
        // raceGraph would be ok though. Needs further investigation
        const curData = _.cloneDeep(globalWamp.currentData!);

        const newData = theProc!.process([data[0]]);

        doDistribute(curData, newData);
        globalWamp.currentData = { ...newData };
      });
    };
    conn.open();

    globalWamp.conn = conn;
    globalWamp.currentLiveId = id;
  };

  const resetUi = () => {
    dispatch(classificationSettings(defaultStateData.classification));
    dispatch(messagesSettings(defaultStateData.messages));
    dispatch(raceGraphSettings(defaultStateData.raceGraph));
    dispatch(raceGraphRelativeSettings(defaultStateData.raceGraphRelative));
    dispatch(racePositionsSettings(defaultStateData.racePositions));
    dispatch(driverLapsSettings(defaultStateData.driverLaps));
    dispatch(pitstopsSettings(defaultStateData.pitstops));
    dispatch(stintsSettings(defaultStateData.stints));
    dispatch(stintSummarySettings(defaultStateData.stintSummary));
    dispatch(driverStintsSettings(defaultStateData.driverStints));
    dispatch(circleOfDoomSettings(defaultStateData.circleOfDoom));
    dispatch(replaySettings(defaultStateData.replay));
    dispatch(globalSettings(defaultStateData.global));
    dispatch(updateAvailableStandingsColumns([]));
    dispatch(updateAvailableCars([]));
    dispatch(updateAvailableCarClasses([]));
  };

  const onLiveButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.value as string;
    if (globalWamp.currentLiveId === undefined) {
      connectToLiveData(id);
    } else {
      if (id.localeCompare(globalWamp.currentLiveId) === 0) {
        // do nothing - user wanted to connect to current session
        console.log("ignoring - already connection to session");
      } else {
        if (globalWamp.conn !== undefined) {
          console.log("closing connection");
          globalWamp.conn.close();
        }
        connectToLiveData(id);
      }
    }

    resetUi();
    history.push("/analysis");
    // setTimeout(() => setLoading(false), 2000);
  };

  const onReloadRequested = () => {
    console.log("fetching current live data providers");
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.list_providers").then((data: any) => {
        setLivedata(data.map((v: any) => ({ key: v.key, title: v.name, description: v.description })));
        conn.close();
      });
    };
    conn.open();
  };

  const onLoadEvents = () => {
    console.log("fetching events");
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.archive.events").then((data: any) => {
        setEvents(
          data.map((v: any) => ({ key: v.eventKey, title: v.name, description: v.description, eventId: v.id }))
        );
        conn.close();
      });
    };
    conn.open();
  };

  return (
    <Row gutter={16}>
      <Col span={10}>
        <List
          header={<h3>Demo races</h3>}
          dataSource={events}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                // <Button value={item.key} type="default" onClick={onLoadButtonClicked_OoO}>
                //   Load
                // </Button>,
                <Button value={item.eventId} type="default" onClick={onLoadForReplayButtonClicked}>
                  Load
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <Modal title="Loading" visible={loading} closable={false} footer={<></>}>
          {info}
        </Modal>
      </Col>
      <Col span={8}>
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
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button value={item.key} type="default" onClick={onLiveButtonClicked}>
                  Connect
                </Button>,
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};
