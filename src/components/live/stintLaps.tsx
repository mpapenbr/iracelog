import { Col, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryStack,
  VictoryTheme,
  VictoryThemeDefinition,
} from "victory";
import { ApplicationState } from "../../stores";
import { IStintInfo } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";

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
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);

  const allCarNums =
    carStints.length > 0
      ? wamp.carStints
          .map((v) => v.carNum)
          .sort(sortCarNumberStr)
          .reverse() // we want the lowest number to be at the top
      : [];
  // console.log(allCarNums);
  const maxPitstops = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  let lookup = new Map<string, IStintInfo>();

  const stackerData = _.range(maxPitstops).map((idx) => {
    return allCarNums.map((carNum) => {
      const found = carStints.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        const id = _.uniqueId();
        lookup.set(id, found!.history[idx]);
        return { id: id, carNum: carNum, numLaps: found!.history[idx].numLaps };
      } else return { id: "", carNum: carNum, numLaps: 0 };
    });
  });
  const lastStint = allCarNums.map((carNum, idx) => {
    const foundStint = carStints.find((v) => v.carNum === carNum);
    if (foundStint?.current.isCurrentStint) {
      const id = _.uniqueId();
      lookup.set(id, foundStint!.current);
      return { id: id, carNum: carNum, numLaps: foundStint!.current.numLaps };
    } else return { id: "", carNum: carNum, numLaps: 0 };
  });

  stackerData.push(lastStint);

  const myTheme: VictoryThemeDefinition = {
    ...VictoryTheme.material,
    stack: {
      //colorScale: ["#f7b792", "#f28b50"],
      colorScale: ["lightgreen", "SandyBrown", "lightyellow"],
    },
  };
  return (
    <>
      <Row gutter={16}>
        <Col span={22}>
          <VictoryChart
            width={1500}
            height={200 + allCarNums.length * 20}
            standalone={true}
            theme={myTheme}
            // domain={graphDomain}
            domainPadding={{ x: [20, 10], y: [0, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {stackerData.map((item, idx) => (
                <VictoryBar
                  horizontal
                  key={_.uniqueId()}
                  x="carNum"
                  y="numLaps"
                  data={item}
                  labels={({ datum }) => sprintf("%d", datum.numLaps)}
                  labelComponent={
                    <VictoryLabel
                      dx={-20}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      // text={({ datum }) => sprintf("%d", idx)}
                    />
                  }
                />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintLaps;
