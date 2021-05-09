import { Col, Empty, Row } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const FakeLoaderPage: React.FC<MyProps> = (props: MyProps) => {
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
