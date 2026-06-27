import { Col, Row } from "antd";
import React from "react";
import { LatestEvents } from "../components/events/latestEvents";
import { LatestEventsGrpc } from "../components/events/latestEventsGrpc";
import { LiveEvents } from "../components/events/liveEventsGrpc";
import { SimpleSearchEvents } from "../components/events/simpleSearchEvents";
import { API_GRAPHQL_ENABLED } from "../constants";

export const Events: React.FC = () => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          {/* <LatestEventsGrpc /> */}
          {API_GRAPHQL_ENABLED === true ? <LatestEvents /> : <LatestEventsGrpc />}
        </Col>

        <Col xs={24} xl={12}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <LiveEvents />
            </Col>
          </Row>
          {API_GRAPHQL_ENABLED === true ? (
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <SimpleSearchEvents />
              </Col>
            </Row>
          ) : (
            <></>
          )}
          {/* {serverSettings.supportsLogins === true ? (
            <Row>
              <Col span={24}>
                <DemoLogin />
              </Col>
            </Row>
          ) : (
            <></>
          )} */}
          {/* <Row>
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
    </>
  );
};
