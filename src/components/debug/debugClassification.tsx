import {
  Car,
  TimeWithMarker,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/racestate/v1/racestate_pb";

import { Col, Row, Table, TableProps } from "antd";
import _ from "lodash";
import * as React from "react";
import { useAppSelector } from "../../stores";
import { lapTimeString } from "../../utils/output";

export const DebugClassification: React.FC = () => {
  const classification = useAppSelector((state) => state.classification);

  const columns: TableProps<Car>["columns"] = [
    {
      title: "CarIdx",
      dataIndex: "carIdx",
      key: "carIdx",
    },
    {
      title: "Pos",
      dataIndex: "pos",
      key: "pos",
    },
    {
      title: "Lap",
      dataIndex: "lap",
      key: "lap",
    },
    {
      title: "TrackPos",
      dataIndex: "trackPos",
      key: "trackPos",
      render: (trackPos) => trackPos.toFixed(4),
    },
    {
      title: "Last",
      dataIndex: "last",
      key: "last",
      render: (last) => lapTimeString((last as TimeWithMarker).time),
    },
  ];
  return (
    <Row className="raceHeader">
      <Col flex={1}>
        <Table
          dataSource={classification.slice(0, 5)}
          columns={columns}
          rowKey={() => _.uniqueId()}
        />
      </Col>
    </Row>
  );
};
