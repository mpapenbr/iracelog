import { Col, Row, Spin, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import autobahn, { Session } from "autobahn";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { API_CROSSBAR_URL } from "../constants";
import { ApplicationState } from "../stores";
import {
  connectedToServer,
  updateCars,
  updateDummy,
  updateFromStateMessage,
  updateManifests,
  updateMessages,
  updatePitstops,
  updateSession,
} from "../stores/wamp/actions";
import { CarManifest, ICarPitInfo, IDataEntrySpec, InfoMsgManifest, IPitInfo } from "../stores/wamp/types";
import { secAsString } from "../utils/output";

const LiveContent: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const dispatch = useDispatch();
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);

  useEffect(() => {
    if (wamp.connected) {
      return;
    }
    console.log("Now connect to wamp server");
    var conn = new autobahn.Connection({ url: API_CROSSBAR_URL + "/ws", realm: "racelog" });
    conn.onopen = (s: Session) => {
      s.call("racelog.list_providers").then((data: any) => {
        console.log(data);
        const id = data[0].key;
        console.log(data[0].name);
        console.log(data[0].description);
        s.call("racelog.get_manifests", [id]).then((data: any) => {
          console.log(data);
          dispatch(updateManifests(data));
        });
        dispatch(connectedToServer());
        s.subscribe("dummy", (data) => {
          dispatch(updateDummy(data));
        });
        s.subscribe(sprintf("racelog.state.%s", id), (data) => {
          dispatch(updateFromStateMessage(data[0].payload));
          // dispatch(updateSession([data[0].payload.session]));
          // dispatch(updateMessages([data[0].payload.messages]));
          // dispatch(updateCars([data[0].payload.cars]));
          // dispatch(updatePitstops([data[0].payload.pitstops]));
        });
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
      });
    };
    conn.open();
  }, [loadTrigger, wamp.connected]);

  return wamp.connected ? (
    <>
      {/* <DummySessionInfoData />
      <DummyStandings /> */}
      {/* <RaceGraph /> */}

      <Row gutter={12}>
        <Col span={6}>
          <DummyPitstops />
        </Col>
        <Col span={8}>
          <DummyMessages />
        </Col>
        <Col span={8}>
          <DummyPitstopHistory />
        </Col>
      </Row>
    </>
  ) : (
    <Spin />
  );
};

const formatTime = (d: any) => (typeof d === "number" ? secAsString(d) : d);

const DummyPitstops: React.FC<{}> = () => {
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const getValue = (d: [], key: string) => getValueViaSpec(d, CarManifest, key);
  const columns: ColumnsType<ICarPitInfo> = [
    { key: "carNum", title: "Num", render: (d) => d.carNum },
    { key: "lapExit", title: "From", render: (d) => d.current.lapExit },
    { key: "exitTime", title: "Exit", render: (d) => formatTime(d.current.exitTime) },
    { key: "stintTime", title: "Stint", render: (d) => formatTime(d.current.stintTime) },
    { key: "laneTime", title: "Lane", render: (d) => formatTime(d.current.laneTime) },
  ];
  // console.log(data);
  const data = carPits.slice().sort((a, b) => parseInt(a.carNum) - parseInt(b.carNum));
  return <Table columns={columns} dataSource={data} rowKey={() => _.uniqueId()} />;
};

const DummyPitstopHistory: React.FC<{}> = () => {
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const getValue = (d: [], key: string) => getValueViaSpec(d, CarManifest, key);
  const columns: ColumnsType<IPitInfo> = [
    { key: "carNum", title: "Num", render: (d) => d.carNum },
    { key: "lapExit", title: "From", render: (d) => d.lapExit },
    { key: "exitTime", title: "Exit", render: (d) => formatTime(d.exitTime) },
    { key: "stintTime", title: "Stint", render: (d) => formatTime(d.stintTime) },
    { key: "lapEnter", title: "To", render: (d) => d.lapEnter },
    { key: "enterTime", title: "Enter", render: (d) => formatTime(d.enterTime) },
    { key: "laneTime", title: "Lane", render: (d) => formatTime(d.laneTime) },
  ];
  // console.log(data);
  const work = carPits.slice().sort((a, b) => parseInt(a.carNum) - parseInt(b.carNum));
  const data: IPitInfo[] = work.reduce((prev, cur) => {
    cur.history
      .slice()
      .reverse()
      .forEach((v) => {
        prev.push({ ...v });
      });
    return prev;
  }, [] as IPitInfo[]);
  return <Table columns={columns} dataSource={data} rowKey={() => _.uniqueId()} />;
};

interface IInfoMsgData {
  timestamp: Date;
  type: string;
  msg: string;
}
const DummyMessages: React.FC<{}> = () => {
  const infoMsgRaw = useSelector((state: ApplicationState) => state.wamp.data.infoMsgs);
  const data = infoMsgRaw.reduce((work, current) => {
    return work.concat(
      current.data.map((v: any) => ({
        timestamp: new Date(current.timestamp * 1000),
        type: getValueViaSpec(v, InfoMsgManifest, "type"),
        carClass: getValueViaSpec(v, InfoMsgManifest, "carClass"),
        msg: getValueViaSpec(v, InfoMsgManifest, "msg"),
      }))
    );
  }, []);
  const columns: ColumnsType<IInfoMsgData> = [
    { key: "timestamp", title: "Time", dataIndex: "timestamp", render: (d: Date) => d.toLocaleTimeString() },
    { key: "type", title: "Type", dataIndex: "type" },
    { key: "carClass", title: "CarClass", dataIndex: "carClass" },
    { key: "msg", title: "Message", dataIndex: "msg" },
  ];

  return <Table columns={columns} dataSource={data} rowKey={() => _.uniqueId()} />;
};

const getValueViaSpec = (data: [], spec: IDataEntrySpec[], key: string): any => {
  const idx = spec.findIndex((v) => v.name === key);
  if (idx < 0) {
    return undefined;
  } else {
    return data[idx];
  }
};

export default LiveContent;
