import { Col, Row, Select } from "antd";
import * as React from "react";
import { WeatherEvolution } from "../components/weather/weather";

const { Option } = Select;

export const WeatherContainer: React.FC = () => {
  return (
    <>
      <Row>
        <Col>
          <h3>Weather over session time</h3>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <WeatherEvolution />
        </Col>
      </Row>
    </>
  );
};
