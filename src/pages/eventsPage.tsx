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
      <Row gutter={16}>
        <Col span={12}>
          {/* <LatestEventsGrpc /> */}
          {API_GRAPHQL_ENABLED === true ? <LatestEvents /> : <LatestEventsGrpc />}
        </Col>

        <Col span={12}>
          <Row>
            <Col span={24}>
              <LiveEvents />
            </Col>
          </Row>
          {API_GRAPHQL_ENABLED === true ? (
            <Row>
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
