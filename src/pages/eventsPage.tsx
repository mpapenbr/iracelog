import { Col, Row } from "antd";
import React from "react";
import { LatestEvents } from "../components/events/latestEvents";
import { LiveEvents } from "../components/events/liveEvents";
import { SimpleSearchEvents } from "../components/events/simpleSearchEvents";

export const Events: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <LatestEvents />
      </Col>

      <Col span={12}>
        <Row>
          <Col span={24}>
            <LiveEvents />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <SimpleSearchEvents />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
