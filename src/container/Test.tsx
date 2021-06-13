import { Col, Row } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { ReplayControlDummy } from "../components/replayControlDummy";
import { ApplicationState } from "../stores";

export const TestContainer: React.FC<{}> = () => {
  const value = useSelector((state: ApplicationState) => state.userSettings.counter);

  return (
    <Row gutter={16}>
      <Col>
        <ReplayControlDummy />
        <p>{value}</p>
      </Col>
    </Row>
  );
};
