import { Col, Row } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { DummyRaceGraph } from "../components/dummyRaceGraph";
import CarFilter from "../components/live/carFilter";
import { ApplicationState } from "../stores";

export const TestContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const props = {
    availableCars: cars,
    availableClasses: [],
    selectedCars: [],
    selectedCarClasses: [],
    onSelectCarFilter: (v: any) => {},
    onSelectCarClassFilter: (v: any) => {},
  };
  return (
    <Row gutter={16}>
      <CarFilter {...props} />
      <Col>
        <DummyRaceGraph />
      </Col>
    </Row>
  );
};
