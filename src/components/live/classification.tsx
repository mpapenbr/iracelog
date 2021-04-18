import { Card, Col, Row, Statistic, Table } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { uiClassificationSettings } from "../../stores/ui/actions";
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
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.classificationSettings);
  const carsRaw = useSelector((state: ApplicationState) => state.wamp.data.cars.data);
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
  const columns: ColumnsType<{}> = [
    { key: "pos", title: "Pos", render: (d) => getValue(d, "pos") },
    { key: "pic", title: "PIC", render: (d) => getValue(d, "pic") },
    { key: "carNum", title: "Num", render: (d) => getValue(d, "carNum") },
    { key: "carClass", title: "Class", render: (d) => getValue(d, "carClass") },
    { key: "state", title: "State", render: (d) => getValue(d, "state") },
    { key: "userName", title: "Driver", render: (d) => getValue(d, "userName") },
    { key: "laps", title: "Lap", render: (d) => getValue(d, "lap") },
    { key: "last", title: "Last", render: (d) => coloredTimeData(d, "last") },
    {
      key: "best",
      title: "Best",
      render: (d) => {
        const v = getValue(d, "best");
        return v > 0 ? lapTimeString(v) : "";
      },
    },
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
  // className="istint-compact"

  const pagination: TablePaginationConfig = {
    defaultPageSize: 20,
    pageSize: uiSettings.pageSize,
    onShowSizeChange: (curPage, newPageSize) => {
      // console.log("current:" + curPage + " new: " + newPageSize);
      dispatch(uiClassificationSettings({ ...uiSettings, pageSize: newPageSize }));
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
