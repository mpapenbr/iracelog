import { Col, Empty, Row } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

export const FakeLoaderPage: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <>
      <Row>
        <Col span={4}>
          <Empty description="Currently empty" />
        </Col>
      </Row>
      <Row>{/* <RaceGraph /> */}</Row>
    </>
  );
};
