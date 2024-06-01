import { Col, Row } from "antd";
import React from "react";
//import { LatestEvents } from "../components/events/latestEvents";
import { LatestEventsGrpc } from "../components/events/latestEventsGrpc";
import { LiveEvents } from "../components/events/liveEventsGrpc";

export const Events: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <LatestEventsGrpc />
      </Col>

      <Col span={12}>
        <Row>
          <Col span={24}>
            <LiveEvents />
          </Col>
        </Row>
        {/* <Row>
          <Col span={24}>
            <SimpleSearchEvents />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DebugSession />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DebugClassification />
          </Col>
        </Row> */}
      </Col>
    </Row>
  );
};
