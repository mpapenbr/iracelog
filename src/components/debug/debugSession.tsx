import { Col, Row } from "antd";
import * as React from "react";
import { useAppSelector } from "../../stores";
import { secAsString } from "../../utils/output";

export const DebugSession: React.FC = () => {
  const session = useAppSelector((state) => state.session);
  return (
    <Row className="raceHeader">
      <Col flex={1}>
        <table width="100%" style={{ lineHeight: "1rem" }}>
          <tbody>
            <tr>
              <td>State</td>
              <td align="right">{session.flagState}</td>
            </tr>
            <tr>
              <td>Time</td>
              <td align="right">{secAsString(session.sessionTime)}</td>
            </tr>
            <tr>
              <td>Time remain</td>
              <td align="right">{secAsString(session.timeRemain)}</td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};
