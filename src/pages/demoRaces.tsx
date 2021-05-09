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
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../commons/globals";
import { API_CROSSBAR_URL } from "../constants";
import { distributeChanges } from "../processor/processData";
import { ApplicationState } from "../stores";
import {
  updateAvailableCarClasses,
  updateAvailableCars,
  updateCarInfo,
  updateCarLaps,
  updateCarPits,
  updateCarStints,
  updateClassification,
  updateInfoMessages,
  updateRaceGraph,
  updateSessionInfo,
} from "../stores/racedata/actions";
import { ICarBaseData, ICarClass } from "../stores/racedata/types";
import {
  classificationSettings,
  driverLapsSettings,
  driverStintsSettings,
  messagesSettings,
  pitstopsSettings,
  raceGraphRelativeSettings,
  raceGraphSettings,
  racePositionsSettings,
  stintsSettings,
} from "../stores/ui/actions";
import { defaultStateData } from "../stores/ui/reducer";
import {
  connectedToServer,
  reset,
  setData,
  updateCars,
  updateManifests,
  updateMessages,
  updatePitstops,
  updateSession,
} from "../stores/wamp/actions";
import { postProcessManifest } from "../stores/wamp/reducer";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const DemoRaces: React.FC<MyProps> = (props: MyProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Loading data....");
  const [livedata, setLivedata] = useState([] as any[]);

  useEffect(() => {
    onReloadRequested();
  }, [loadTrigger]);

  const onLoadButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    const arg = e.currentTarget.value;
    // readData(arg, dispatch, doInfo);
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.archive.get_manifest", [arg]).then((manifestData: any) => {
        // console.log(manifestData);
        setLoading(true);
        dispatch(reset());
        resetUi();
        const mData = JSON.parse(manifestData[0]);
        s.call("racelog.analysis.archive", [arg]).then((data: any) => {
          // console.log(data);
          // dispatch(setData(data)); // to be removed!
          doDistribute(defaultProcessRaceStateData, data);
          dispatch(updateManifests(mData));
          conn.close();
          setLoading(false);
          history.push("/analysis");
        });
      });
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
        dispatch(setData({ ...data.processedData, manifests: manifests }));
        globalWamp.processor = new BulkProcessor(manifests, data.processedData);

        doDistribute(defaultProcessRaceStateData, data.processedData);
        globalWamp.currentData = data.processedData;
        // globalWamp.processor.process(data.processedData, []); // workaround
      });
      dispatch(connectedToServer());

      s.subscribe(sprintf("racelog.state.%s", id), (data) => {
        // dispatch(updateFromStateMessage(data[0]));
        const theProc = globalWamp.processor;
        // important, otherwise we don't detect changes on carLaps,carStints,.... (all those Array.from(...) attrs of BulkProcessor)
        // raceGraph would be ok though. Needs further investigation
        const curData = _.cloneDeep(globalWamp.currentData!);
        // const merk = globalWamp.currentData?.carLaps[0].laps.length;
        // const bigMerk = [...curData!.carLaps[0].laps];
        const newData = theProc!.process([data[0]]);
        // console.log(
        //   "merk: " +
        //     merk +
        //     "bigMerk: " +
        //     bigMerk.length +
        //     " curData: " +
        //     curData!.carLaps[0].laps.length +
        //     " current:" +
        //     globalWamp.currentData?.carLaps[0].laps.length +
        //     " new: " +
        //     newData.carLaps[0].laps.length
        // );
        doDistribute(curData, newData);
        globalWamp.currentData = { ...newData };
        // dispatch(updateSession([data[0].payload.session]));
        // dispatch(updateMessages([data[0].payload.messages]));
        // dispatch(updateCars([data[0].payload.cars]));
        // dispatch(updatePitstops([data[0].payload.pitstops]));
      });
      if (false) {
        s.subscribe(sprintf("racelog.session.%s", id), (data) => {
          dispatch(updateSession(data));
        });
        s.subscribe(sprintf("racelog.messages.%s", id), (data) => {
          dispatch(updateMessages(data));
        });
        s.subscribe(sprintf("racelog.cars.%s", id), (data) => {
          dispatch(updateCars(data));
        });
        s.subscribe(sprintf("racelog.pits.%s", id), (data) => {
          dispatch(updatePitstops(data));
        });
      }
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
    dispatch(driverStintsSettings(defaultStateData.driverStints));
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

  const data = [
    {
      title: "AI demo: GT3 race Watkins",
      description: "3h+ race with 20 GT3",
      key: "1",
    },
    {
      title: "AI demo: The Special Characters at Watkins",
      description:
        "a lot of pitstops, short stints, mainly used to check if umlauts and other character decorations are ok.",
      key: "2",
    },
    {
      title: "AI Demo: GT3 race at Barcelona",
      description: "3h race longer stints, 30 GT3",
      key: "3",
    },
    {
      title: "AI Demo: P217 race at Spa",
      description: "3h race, medium tank, resets, repair stops",
      key: "68d4ff7adbb3412b8da2ab53daf01453",
    },
    {
      title: "NEC 2021 Race #2",
      description: "Test for Nordschleife",
      key: "28a7b97ab9aeb613d1c7c75461f3baec",
    },
    {
      title: "NEO Race 6h Barcelona",
      description: "Used for Multiclass tests. Be patient while loading (~15s)",
      key: "neo",
    },
    {
      title: "NEO Race 12h Spa",
      description: "Used for Multiclass tests. Be a little more patient while loading (~30s)",
      key: "26ceac390dcac80d439992c98b0a9db8",
    },
  ];
  return (
    <Row gutter={16}>
      <Col span={6}>
        <List
          header={<h3>Demo races</h3>}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button value={item.key} type="default" onClick={onLoadButtonClicked}>
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
              <Col offset={10}>
                {" "}
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
