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
const StintLaps: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const carLaps = useSelector((state: ApplicationState) => state.wamp.data.carLaps);
  const allCarNums = carPits.length > 0 ? wamp.carPits.map((v) => v.carNum).sort() : [];

  const maxPitstops = carPits.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const stackerData = _.range(maxPitstops).map((idx) => {
    return allCarNums.map((carNum) => {
      const found = carPits.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        return found!.history[idx];
      } else return { carNum: carNum, numLaps: 0 };
    });
  });
  const lastStint = allCarNums.map((carNum, idx) => {
    const foundPit = carPits.find((v) => v.carNum === carNum);
    const foundLaps = carLaps.find((v) => v.carNum === carNum);
    const lastStintLaps = _.last(foundLaps?.laps)!.lapNo - foundPit!.current.lapExit;
    return { carNum: carNum, numLaps: lastStintLaps };
  });

  stackerData.push(lastStint);
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
            domainPadding={{ x: [20, 10], y: [0, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {stackerData.map((item, idx) => (
                <VictoryBar horizontal key={_.uniqueId()} x="carNum" y="numLaps" data={item} />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintLaps;
