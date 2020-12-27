import { Col, Row, Slider, Space, Statistic, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { useState } from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { defaultRaceLogMeta, IRaceLogMeta } from "../stores/raceevents/types";
import { lapTimeString, secAsString } from "../utils/output";

type TParams = { id: string };
function MyTry({ match }: RouteComponentProps<TParams>) {
  const [current, setCurrent] = useState(defaultRaceLogMeta);
  const afterChangeHandler = (arg: number) => {
    RaceEventService.logData("TBD_TOKEN", myId, 0, arg).then((v: IRaceLogMeta[]) => {
      if (v && v.length > 0) {
        // console.log(v[0].sessionTime);
        // console.log(v[0].data.carIdxPosition);

        setCurrent(v[0]);
      } else {
        console.log("No data");
      }
    });
  };
  const location = useLocation();
  // console.log(location.pathname);
  const regex = /.*?\/details\/(?<myId>.*?)\/try$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  // console.log(myId);
  const byResultPos = buildRaceEntriesByPosition(current);
  const byTrackPos = buildRaceEntriesByPosition(current).sort((a, b) =>
    a.lapsComplete === b.lapsComplete ? b.trackPos - a.trackPos : b.lapsComplete - a.lapsComplete
  );
  return (
    <div>
      <Slider min={0} max={1100} step={1} onAfterChange={afterChangeHandler} />

      <Row gutter={8}>
        <Col>
          <RaceByResultPosition entries={byResultPos} selectColumns={["pos", "carIdx", "lap", "lastLapTime", "pit"]} />
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
  trackPos: number;
  pit: boolean;
  name: string;
  lastLapTime: number;
  lapsComplete: number;
  currentLap: number;
}

const buildRaceEntriesByPosition = (raceLog: IRaceLogMeta): MyRaceEntry[] => {
  const ret: MyRaceEntry[] = raceLog.data.carIdxPosition
    .map((v, idx) => ({
      position: v,
      carIdx: idx,
      name: "tbd",
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
