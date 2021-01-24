import { ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Row, Select, Slider, Space, Spin, Statistic, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { range, uniqueId } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { sprintf } from "sprintf-js";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { defaultDriverData, IDriver, IDriverMeta } from "../stores/drivers/types";
import { ensureEventData, loadEventData } from "../stores/raceevents/actions";
import { defaultRaceLogMeta, IRaceLogMeta } from "../stores/raceevents/types";
import { lapTimeString, secAsString } from "../utils/output";

const { Option } = Select;

type TParams = { id: string };
function MyTry({ match }: RouteComponentProps<TParams>) {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const regex = /.*?\/details\/(?<myId>.*?)\/try$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("Now trigger load event details for " + myId);
    //delegate();
    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  }, [loadTrigger]);

  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);

  const driverData = raceContainer.drivers;

  const [currentSessionNum, setCurrentSessionNum] = useState(0);

  const [current, setCurrent] = useState(defaultRaceLogMeta);
  const afterChangeHandler = (arg: number) => {
    RaceEventService.logData("TBD_TOKEN", myId, currentSessionNum, arg).then((v: IRaceLogMeta[]) => {
      if (v && v.length > 0) {
        setCurrent(v[0]);
      } else {
        console.log("No data");
      }
    });
  };

  const onReloadRequested = () => {
    dispatch(loadEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  };

  var currentSession = raceContainer.summary.sessionSummaries.find((item) => item.sessionNum === currentSessionNum);
  if (currentSession === undefined) {
    currentSession = { sessionNum: currentSessionNum, minTime: 0, maxTime: 0, minTick: 0, maxTick: 0, count: 0 };
  }
  if (!raceContainer.loaded) {
    return <Spin />;
  }

  const byResultPos = buildRaceEntriesByPosition(current, driverData);
  const byTrackPos = buildRaceEntriesByPosition(current, driverData).sort((a, b) =>
    a.lapsComplete === b.lapsComplete ? b.trackPos - a.trackPos : b.lapsComplete - a.lapsComplete
  );

  const renderSessionOptions = () => {
    if (raceContainer.eventData.sessions !== null) {
      return (
        <>
          {raceContainer.eventData.sessions.map((item) => (
            <Option value={item.num}>Session {item.name}</Option>
          ))}
        </>
      );
    } else {
      return (
        <>
          {raceContainer.summary.sessionSummaries.map((item) => (
            <Option value={item.sessionNum}>Session {item.sessionNum}</Option>
          ))}
        </>
      );
    }
  };
  return (
    <div>
      <Row gutter={8}>
        <Col>
          <Select defaultValue={currentSessionNum} onChange={(d) => setCurrentSessionNum(d)}>
            {renderSessionOptions()}
            {/* {raceContainer.eventData.sessions.map((item) => (
          <Option value={item.num}>Session {item.name}</Option>
        ))} */}
          </Select>
        </Col>
        <Col>
          <Info raceLog={current} />
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={onReloadRequested} />
        </Col>
      </Row>
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
            selectColumns={["pos", "carIdx", "carNumberRaw", "currentLap", "trackPos", "dist", "speed", "delta", "pit"]}
          />
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
  speed: number;
  delta: number;
  dist: number;
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
      speed: raceLog.data.carIdxSpeed !== null ? raceLog.data.carIdxSpeed[idx] : -1,
      delta: raceLog.data.carIdxDelta !== null ? raceLog.data.carIdxDelta[idx] : -1,
      dist: raceLog.data.carIdxDistMeters !== null ? raceLog.data.carIdxDistMeters[idx] : -1,
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
  const localId = uniqueId();
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
    { key: "speed", title: "Speed", dataIndex: "speed", render: (d) => sprintf("%d", d) },
    { key: "delta", title: "Delta", dataIndex: "delta", render: (d) => sprintf("%.2f", d) },
    { key: "dist", title: "Dist", dataIndex: "dist", render: (d) => sprintf("%d", d) },
    { key: "pit", title: "InPit", dataIndex: "pit", render: (p) => (p ? "yes" : "") },
  ];
  var showCols: ColumnsType<MyRaceEntry>;
  if (props.selectColumns) {
    showCols = props.selectColumns.map((col) => columns.find((item) => item.key! === col)!);
  } else {
    showCols = columns;
  }
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={dataSource}
      columns={showCols}
      rowKey={(d) => sprintf("%s-%d", localId, d.position)}
    />
  );
};

export default MyTry;
