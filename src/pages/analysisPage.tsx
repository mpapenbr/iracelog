import { Col, Row } from "antd";
import React from "react";
import RaceGraphByReference from "../components/live/raceGraphRelative";

interface IStateProps {}
interface IDispachProps {
  // loadEvents: () => any;
}
type MyProps = IStateProps & IDispachProps;

export const AnalysisMainPage: React.FC<MyProps> = (props: MyProps) => {
  return (
    <>
      <Row>
        <Col span={24}>
          <RaceGraphByReference />
        </Col>
      </Row>
    </>
  );
};
