import { Col, Row, Select } from "antd";
import * as React from "react";
import { LaptimeEvolution } from "../components/speedmap/laptimeEvolution";
import { SpeedInfo } from "../components/speedmap/speedinfo";
import { Speedmap } from "../components/speedmap/speedmap";

const { Option } = Select;

export const SpeedmapContainer: React.FC = () => {
  return (
    <>
      <Row>
        <Col>
          <h3>Speed (km/h) over track position</h3>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Speedmap />
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          <SpeedInfo />
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Laptime progression</h3>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <LaptimeEvolution />
        </Col>
      </Row>
    </>
  );
};
