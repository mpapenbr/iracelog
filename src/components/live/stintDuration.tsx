import { Col, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryStack, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";

interface IVicData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const StintDuration: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);

  const allCarNums = carStints.length > 0 ? wamp.carPits.map((v) => v.carNum).sort() : [];

  const maxPitstops = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const x = _.range(maxPitstops).map((idx) => {
    return allCarNums.map((carNum) => {
      const found = carStints.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        return found!.history[idx];
      } else return { carNum: carNum, stintTime: 0 };
    });
  });

  const lastStint = allCarNums.map((carNum, idx) => {
    const foundPit = carStints.find((v) => v.carNum === carNum);
    return { carNum: carNum, stintTime: foundPit!.current.stintTime };
  });
  x.push(lastStint);

  return (
    <>
      <Row gutter={16}>
        <Col span={22}>
          <VictoryChart
            width={1500}
            height={750}
            standalone={true}
            theme={VictoryTheme.grayscale}
            // domain={graphDomain}
            domainPadding={{ x: [20, 10], y: [50, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {x.map((item, idx) => (
                <VictoryBar horizontal key={_.uniqueId()} x="carNum" y="stintTime" data={item} />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintDuration;
