import { Col, Row } from "antd";
import React from "react";
import { RaceloggerRecorderInput } from "../components/racelogger/recorder";
import { RaceloggerSettings } from "../components/racelogger/settings";
import {
  IRacingStatus,
  RaceloggerBackendStatus,
  RaceloggerStatus,
  RaceloggerStatusLoader,
} from "../components/racelogger/status";

export const Racelogger: React.FC = () => {
  return (
    <>
      <Row>
        <Col span={10}>
          <RaceloggerStatusLoader />
          <RaceloggerStatus />
        </Col>
        <Col flex={1} />
        <Col span={9}>
          <RaceloggerSettings />
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          <RaceloggerBackendStatus />
        </Col>
        <Col span={10}>
          <IRacingStatus />
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <h4>Racelogger Recorder</h4>
          <RaceloggerRecorderInput />
        </Col>
      </Row>
    </>
  );
};
