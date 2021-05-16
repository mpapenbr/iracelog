import { Card, Col, Empty, Row, Statistic, Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { classificationSettings } from "../../stores/ui/actions";
import { getValueViaSpec } from "../../stores/wamp/compute/util";
import { SessionManifest } from "../../stores/wamp/types";
import { lapTimeString, secAsString } from "../../utils/output";

const Classification: React.FC<{}> = () => {
  return (
    <>
      <Row>
        <Col span={24}>
          <SessionInfoData />
        </Col>
      </Row>
      {/* <Row>
        <Col span={24}>
          <CircleOfDoom />
        </Col>
      </Row> */}

      <Row>
        <Col span={24}>
          <Standings />
        </Col>
      </Row>
    </>
  );
};
export default Classification;

const Standings: React.FC<{}> = () => {
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.classification);
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const dispatch = useDispatch();
  const getValue = (d: [], key: string) => getValueViaSpec(d, stateCarManifest, key);

  const coloredTimeData = (d: [], key: string) => {
    const value = getValueViaSpec(d, stateCarManifest, key);
    if (typeof value === "number") {
      return value > 0 ? lapTimeString(value) : "";
    } else {
      const [v, info] = value;
      if (v < 0) return "";
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

  const nullAwareOutput = (value: any, format: string): string => {
    if (typeof value === "number") {
      return sprintf(format, value);
    } else return "";
  };
  const lapsOutput = (d: any) => {
    if (getValue(d, "state") === "OUT") {
      // console.log(getValue(d, "lc"));
      return getValue(d, "lc");
    } else return getValue(d, "lap");
  };

  const trackPosGraph = (d: any) => {
    const pos = d * 100 + "%";
    return (
      <svg width="80px" height="12">
        <rect x={0} y={0} width="100%" height="100%" style={{ stroke: "grey", fillOpacity: 0 }} />
        <rect x={pos} y={0} width={2} height="100%" style={{ fill: "black" }} />
      </svg>
    );
  };
  const columns: ColumnsType<{}> = [
    { key: "pos", title: "Pos", render: (d) => getValue(d, "pos") },
    { key: "pic", title: "PIC", render: (d) => getValue(d, "pic") },
    { key: "carNum", title: "Num", render: (d) => getValue(d, "carNum") },
    { key: "carClass", title: "Class", render: (d) => getValue(d, "carClass") },
    { key: "state", title: "State", render: (d) => getValue(d, "state") },
    { key: "userName", title: "Driver", render: (d) => getValue(d, "userName") },
    { key: "laps", title: "Lap", render: (d) => lapsOutput(d) },
    { key: "last", title: "Last", render: (d) => coloredTimeData(d, "last") },
    {
      key: "best",
      title: "Best",
      render: (d) => {
        const v = getValue(d, "best");
        return v > 0 ? lapTimeString(v) : "";
      },
    },
    // { key: "trackPos", title: "CurPos", render: (d) => nullAwareOutput(getValue(d, "trackPos"), "%.4f") },
    { key: "trackPos2", title: "TrackPos", render: (d) => trackPosGraph(getValue(d, "trackPos")) },
    { key: "dist", title: "Dist", render: (d) => nullAwareOutput(getValue(d, "dist"), "%.0f") },
    { key: "gap", title: "Gap", render: (d) => nullAwareOutput(getValue(d, "gap"), "%.1f") },
    { key: "interval", title: "Int", render: (d) => nullAwareOutput(getValue(d, "interval"), "%.1f") },
    { key: "speed", title: "Speed", render: (d) => nullAwareOutput(getValue(d, "speed"), "%.0f") },
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
  // className="istint-compact"

  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);
      // dispatch(uiClassificationSettings({ ...uiSettings, pageSize: newPageSize }));
      dispatch(classificationSettings({ pageSize: newPageSize }));
    },
    showSizeChanger: true,
  };
  return (
    <Table
      className="iracelog-compact"
      pagination={pagination}
      columns={columns}
      dataSource={carsRaw}
      rowKey={() => _.uniqueId()}
    />
  );
};

const SessionInfoData: React.FC<{}> = () => {
  const sessionData: [] = useSelector(
    (state: ApplicationState) =>
      // state.wamp.data.session ? state.wamp.data.session.data : []
      state.raceData.sessionInfo.data
  );

  if (sessionData.length === 0) return <Empty description="No session data available" />;
  const getValue = (key: string) => {
    return getValueViaSpec(sessionData, SessionManifest, key);
  };
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
