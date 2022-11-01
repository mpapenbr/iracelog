import { Col, Row } from "antd";
import React from "react";
import { LatestEvents } from "../components/events/latestEvents";
import { LiveEvents } from "../components/events/liveEvents";

export const Events: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <LatestEvents />
      </Col>
      <Col span={12}>
        <LiveEvents />
      </Col>
    </Row>
  );
};
