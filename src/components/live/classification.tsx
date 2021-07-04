import { SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Popover, Row, Statistic } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { getValueViaSpec } from "../../stores/wamp/compute/util";
import { SessionManifest } from "../../stores/wamp/types";
import { secAsString } from "../../utils/output";
import { Standings } from "../standings";
import StandingsColumnControl from "../standingsColumnControl";

const Classification: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars).map((v) => v.carNum);
  return (
    <>
      <Row align="bottom">
        <Col span={23}>
          <SessionInfoData />
        </Col>
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

const SessionInfoData: React.FC<{}> = () => {
  const sessionData: [] = useSelector(
    (state: ApplicationState) =>
      // state.wamp.data.session ? state.wamp.data.session.data : []
      state.raceData.sessionInfo.data
  );

  if (sessionData.length === 0) return <Empty description="No session data available" />;
  const getValue = (key: string) => {
    return getValueViaSpec(sessionData, SessionManifest, key);
  };
  const gridStyle = { width: "25%" };
  // const gridStyle = {};

  return (
    <>
      <Row>
        <Col span={12}>
          <Card>
            <Card.Grid style={gridStyle}>
              <Statistic title="Session time" value={secAsString(getValue("sessionTime"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Remaining time" value={secAsString(getValue("timeRemain"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Time of day" value={secAsString(getValue("timeOfDay"))} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Flag" value={getValue("flagState")} />
            </Card.Grid>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Card.Grid style={gridStyle}>
              <Statistic title="Track temp" precision={1} value={getValue("trackTemp")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Air temp" precision={1} value={getValue("airTemp")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Wind direction" precision={1} value={getValue("windDir")} />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <Statistic title="Wind speed (m/s)" precision={1} value={getValue("windVel")} />
            </Card.Grid>
          </Card>
        </Col>
      </Row>
    </>
  );
};
