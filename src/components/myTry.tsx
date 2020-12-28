import { Col, Row, Select, Slider, Space, Statistic, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { range } from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { defaultDriverData, IDriver, IDriverMeta } from "../stores/drivers/types";
import { defaultRaceLogMeta, IRaceLogMeta } from "../stores/raceevents/types";
import { lapTimeString, secAsString } from "../utils/output";

const { Option } = Select;

type TParams = { id: string };
function MyTry({ match }: RouteComponentProps<TParams>) {
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  const driverData = useSelector((state: ApplicationState) => state.eventDrivers.data);

  const [currentSessionNum, setCurrentSessionNum] = useState(0);

  const [current, setCurrent] = useState(defaultRaceLogMeta);
  const afterChangeHandler = (arg: number) => {
    RaceEventService.logData("TBD_TOKEN", myId, currentSessionNum, arg).then((v: IRaceLogMeta[]) => {
      if (v && v.length > 0) {
        // console.log(v[0].sessionTime);
        // console.log(v[0].data.carIdxPosition);

        setCurrent(v[0]);
      } else {
        console.log("No data");
      }
    });
  };

  const currentSession = raceContainer.summary.sessionSummaries[currentSessionNum];

  const location = useLocation();
  // console.log(location.pathname);
  const regex = /.*?\/details\/(?<myId>.*?)\/try$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  // console.log(myId);
  const byResultPos = buildRaceEntriesByPosition(current, driverData);
  const byTrackPos = buildRaceEntriesByPosition(current, driverData).sort((a, b) =>
    a.lapsComplete === b.lapsComplete ? b.trackPos - a.trackPos : b.lapsComplete - a.lapsComplete
  );
  return (
    <div>
      <Select defaultValue={currentSessionNum} onChange={(d) => setCurrentSessionNum(d)}>
        {raceContainer.summary.sessionSummaries.map((item) => (
          <Option value={item.sessionNum}>Session {item.sessionNum}</Option>
        ))}
      </Select>
      <Slider min={currentSession.minTime} max={currentSession.maxTime} step={1} onAfterChange={afterChangeHandler} />

      <Row gutter={8}>
        <Col>
          <RaceByResultPosition
            entries={byResultPos}
            selectColumns={["pos", "carIdx", "carNumberRaw", "userName", "lap", "lastLapTime", "pit"]}
          />
        </Col>
        <Col>
          <RaceByResultPosition
            entries={byTrackPos}
            selectColumns={["pos", "carIdx", "currentLap", "trackPos", "pit"]}
          />
        </Col>
        <Col>
          <Info raceLog={current} />
        </Col>
      </Row>
    </div>
  );
}

interface MyProps {
  raceLog: IRaceLogMeta;
}
const Info: React.FC<MyProps> = (props: MyProps) => {
  const decodeState = (s: number): string => {
    switch (s) {
      case 0:
        return "Invalid";
      case 1:
        return "Get in car";
      case 2:
        return "Warmup";
      case 3:
        return "Parade lap";
      case 4:
        return "Racing";
      case 5:
        return "Checkered";
      case 6:
        return "Cool down";
      default:
        return "n.a.";
    }
  };
  return (
    <Space size={8}>
      <Statistic title="Session time" value={secAsString(props.raceLog.sessionTime)} />
      <Statistic title="Remaining time" value={secAsString(props.raceLog.data.sessionTimeRemain)} />
      <Statistic title="State" value={decodeState(props.raceLog.data.sessionState)} />
    </Space>
  );
};

interface MyRaceEntry {
  position: number;
  carIdx: number;
  carNumberRaw: string;
  trackPos: number;
  pit: boolean;
  userName: string;
  name: string;
  lastLapTime: number;
  lapsComplete: number;
  currentLap: number;
}

const buildRaceEntriesByPosition = (raceLog: IRaceLogMeta, driverData: IDriverMeta[]): MyRaceEntry[] => {
  const closestDriverEntry = (carIdx: number): IDriver => {
    const invSortedByTime = driverData
      .filter((d) => d.data.carIdx === carIdx)
      .filter((d) => d.sessionTick <= raceLog.sessionTick)
      .sort((a, b) => b.sessionTime - a.sessionTime);
    // console.log(invSortedByTime);
    return invSortedByTime.length > 0 ? invSortedByTime[0].data : defaultDriverData();
  };
  const carIdxDriverData = range(0, 64).map((i) => closestDriverEntry(i));
  // console.log(carIdxDriverData);

  // zero-leading numbers are coded this way:
  // 3007 -> 007
  // 2001 -> 01
  const adjustRawNumber = (raw: string): string => {
    return raw.length === 4 ? raw.slice(raw.length - parseInt(raw[0])) : raw;
  };
  const ret: MyRaceEntry[] = raceLog.data.carIdxPosition
    .map((v, idx) => ({
      position: v,
      carIdx: idx,
      carNumberRaw: adjustRawNumber(carIdxDriverData[idx].carNumberRaw),
      name: carIdxDriverData[idx].userName,
      userName: carIdxDriverData[idx].userName,
      trackPos: raceLog.data.carIdxLapDistPct[idx],
      lastLapTime: raceLog.data.carIdxLastLapTime[idx],
      lapsComplete: raceLog.data.carIdxLapCompleted[idx],
      currentLap: raceLog.data.carIdxLap[idx],
      pit: raceLog.data.carIdxOnPitRoad[idx],
    }))
    .filter((v) => v.position > 0)
    .sort((a, b) => a.position - b.position);
  return ret;
};
interface RaceEntryTableProps {
  entries: MyRaceEntry[];
  selectColumns?: string[];
}
const RaceByResultPosition: React.FC<RaceEntryTableProps> = (props: RaceEntryTableProps) => {
  const dataSource = props.entries;
  // console.log(dataSource);

  const columns: ColumnsType<MyRaceEntry> = [
    { key: "pos", title: "Pos", dataIndex: "position" },
    { key: "carIdx", title: "CarIdx", dataIndex: "carIdx" },
    { key: "carNumberRaw", title: "#", dataIndex: "carNumberRaw" },
    { key: "name", title: "Driver", dataIndex: "name" },
    { key: "userName", title: "Driver", dataIndex: "userName" },
    { key: "trackPos", title: "TrackPos", dataIndex: "trackPos", render: (d) => sprintf("%.4f", d) },
    { key: "lastLapTime", title: "Laptime", dataIndex: "lastLapTime", render: (d) => lapTimeString(d) },
    { key: "lap", title: "Lap", dataIndex: "lapsComplete" },
    { key: "currentLap", title: "Lap", dataIndex: "currentLap" },
    { key: "pit", title: "InPit", dataIndex: "pit", render: (p) => (p ? "yes" : "") },
  ];
  var showCols: ColumnsType<MyRaceEntry>;
  if (props.selectColumns) {
    showCols = props.selectColumns.map((col) => columns.find((item) => item.key! === col)!);
  } else {
    showCols = columns;
  }
  return (
    <Table size="small" pagination={false} dataSource={dataSource} columns={showCols} rowKey={(d) => d.position} />
  );
};

export default MyTry;
