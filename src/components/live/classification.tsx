import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Popover, Row } from "antd";
import React from "react";
import { useAppSelector } from "../../stores";
import { Standings } from "../standings";
import StandingsColumnControl from "../standingsColumnControl";

const Classification: React.FC = () => {
  const cars = useAppSelector((state) => state.availableCars).map((v) => v.carNum);
  return (
    <>
      <Row align="bottom">
        <Col span={23} />
        <Col>
          <Popover content={<StandingsColumnControl />} title="Select columns">
            <Button icon={<SettingOutlined />} />
          </Popover>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Standings showCars={cars} />
        </Col>
      </Row>
    </>
  );
};
export default Classification;
