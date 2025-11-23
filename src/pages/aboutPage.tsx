import { Col, Row } from "antd";
import React from "react";

export const About: React.FC = () => {
  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <h2>About iRacelog</h2>
          <p>
            iRacelog is an open source project to provide advanced analytics and logging for races
            in iRacing.
          </p>
          <p>
            For additional information, visit {""}
            <a href="https://github.com/mpapenbr/iracelog-documentation" target="_blank">
              this GitHub repository
            </a>
            .
          </p>
        </Col>
      </Row>
    </>
  );
};
