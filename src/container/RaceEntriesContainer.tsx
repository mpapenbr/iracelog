import { Col, Row, Select } from "antd";
import * as React from "react";
import { CarClasses } from "../components/raceentries/carclasses";
import { Cars } from "../components/raceentries/cars";
import { Drivers } from "../components/raceentries/drivers";

const { Option } = Select;

export const RaceEntriesContainer: React.FC = () => {
  return (
    <>
      <Row>
        <Col span={17}>
          <Cars />
        </Col>
        <Col span={7}>
          <CarClasses />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Drivers />
        </Col>
      </Row>
    </>
  );
};
