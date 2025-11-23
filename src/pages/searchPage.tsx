import { Col, Row } from "antd";
import React from "react";
import { SimpleSearchEvents } from "../components/events/simpleSearchEvents";
import { API_GRAPHQL_ENABLED } from "../constants";

export const Search: React.FC = () => {
  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          {API_GRAPHQL_ENABLED === true ? (
            <Col span={24}>
              <SimpleSearchEvents />
            </Col>
          ) : (
            <></>
          )}
        </Col>
      </Row>
    </>
  );
};
