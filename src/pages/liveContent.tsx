import { Card, Col, Row, Spin, Statistic, Table } from "antd";
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
import {
  CarManifest,
  ICarPitInfo,
  IDataEntrySpec,
  InfoMsgManifest,
  IPitInfo,
  SessionManifest,
} from "../stores/wamp/types";
import { lapTimeString, secAsString } from "../utils/output";

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
      <DummySessionInfoData />
      <DummyStandings />
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

const DummyData: React.FC<{}> = () => {
  const dummyData = useSelector((state: ApplicationState) => state.wamp.data.dummy);
  if (typeof dummyData === "object") {
    console.log(dummyData);
    return (
      <>
        {Object.keys(dummyData).map((k) => (
          <Statistic title={k} value="tbd" />
        ))}
      </>
    );
  }
  return <Statistic title="Dummy" value="{dummyData}" />;
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

const DummyStandings: React.FC<{}> = () => {
  const carsRaw = useSelector((state: ApplicationState) => state.wamp.data.cars.data);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const getValue = (d: [], key: string) => getValueViaSpec(d, stateCarManifest, key);

  const coloredTimeData = (d: [], key: string) => {
    const value = getValueViaSpec(d, stateCarManifest, key);
    if (typeof value === "number") {
      return value > 0 ? lapTimeString(value) : "";
    } else {
      const [v, info] = value;
      if (info === "old") {
        return <span style={{ color: "lightgrey" }}>{lapTimeString(v)}</span>;
      }
      if (info === "ob") {
        return <span style={{ color: "purple", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      if (info === "pb") {
        return <span style={{ color: "green", fontWeight: 500 }}>{lapTimeString(v)}</span>;
      }
      return v > 0 ? lapTimeString(v) : "";
    }
  };
  const columns: ColumnsType<{}> = [
    { key: "pos", title: "Pos", render: (d) => getValue(d, "pos") },
    { key: "pic", title: "PIC", render: (d) => getValue(d, "pic") },
    { key: "carNum", title: "Num", render: (d) => getValue(d, "carNum") },
    { key: "carClass", title: "Class", render: (d) => getValue(d, "carClass") },
    { key: "state", title: "State", render: (d) => getValue(d, "state") },
    { key: "userName", title: "Driver", render: (d) => getValue(d, "userName") },
    { key: "laps", title: "Lap", render: (d) => getValue(d, "lap") },
    { key: "last", title: "Last", render: (d) => coloredTimeData(d, "last") },
    { key: "best", title: "Best", render: (d) => lapTimeString(getValue(d, "best")) },
    { key: "trackPos", title: "CurPos", render: (d) => sprintf("%.4f", getValue(d, "trackPos")) },
    { key: "dist", title: "Dist", render: (d) => sprintf("%.0f", getValue(d, "dist")) },
    { key: "gap", title: "Gap", render: (d) => sprintf("%.1f", getValue(d, "gap")) },
    { key: "interval", title: "Int", render: (d) => sprintf("%.1f", getValue(d, "interval")) },
    { key: "speed", title: "Speed", render: (d) => sprintf("%.0f", getValue(d, "speed")) },
  ];
  stateCarManifest
    .filter((v) => /^s\d+$/.test(v.name))
    .forEach((v) =>
      columns.push({
        key: v.name,
        title: v.name.toLocaleUpperCase(),
        render: (d) => coloredTimeData(d, v.name),
      })
    );
  // console.log(data);
  return <Table columns={columns} dataSource={carsRaw} rowKey={() => _.uniqueId()} />;
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

const DummySessionInfoData: React.FC<{}> = () => {
  const sessionData = useSelector((state: ApplicationState) => state.wamp.data.session);
  // console.log(sessionData);
  const getValue = (key: string) => getValueViaSpec(sessionData.data, SessionManifest, key);
  const gridStyle = { width: "25%" };
  return (
    <>
      <Row>
        <Col span={12}>
          <Card>
            <Card.Grid style={gridStyle}>
              <Statistic title="Session time" value={secAsString(getValue("sessionTime"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Remaining time" value={secAsString(getValue("timeRemain"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Time of day" value={secAsString(getValue("timeOfDay"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Flag" value={getValue("flagState")} />
            </Card.Grid>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Card.Grid style={gridStyle}>
              <Statistic title="Track temp" precision={1} value={getValue("trackTemp")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Air temp" precision={1} value={getValue("airTemp")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Wind direction" precision={1} value={getValue("windDir")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Wind speed (m/s)" precision={1} value={getValue("windVel")} />
            </Card.Grid>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default LiveContent;
