import { Col, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryStack, VictoryTheme, VictoryTooltip } from "victory";
import { ApplicationState } from "../../stores";
import { IStintInfo } from "../../stores/wamp/types";
import { secAsString, sortCarNumberStr } from "../../utils/output";

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

  const allCarNums =
    carStints.length > 0
      ? wamp.carStints
          .map((v) => v.carNum)
          .sort(sortCarNumberStr)
          .reverse()
      : [];

  interface ILookup<T> {
    id: string;
    value: T;
  }
  // let lookup = carStints.map((v) => ({ id: _.uniqueId(), data: v.current }));
  let lookup = new Map<string, IStintInfo>();
  // console.log(lookup);

  const maxPitstops = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const x = _.range(maxPitstops).map((idx) => {
    return allCarNums.map((carNum) => {
      const found = carStints.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        const id = _.uniqueId();
        lookup.set(id, found!.history[idx]);
        return { id: id, carNum: carNum, stintTime: found!.history[idx].stintTime };
      } else return { id: "", carNum: carNum, stintTime: 0 };
    });
  });
  // console.log(x);
  const lastStint = allCarNums.map((carNum, idx) => {
    const foundPit = carStints.find((v) => v.carNum === carNum);
    if (foundPit?.current.isCurrentStint) {
      const id = _.uniqueId();
      lookup.set(id, foundPit!.current);
      return { id: id, carNum: carNum, stintTime: foundPit!.current.stintTime };
    } else return { id: "", carNum: carNum, stintTime: 0 };
  });
  // console.log(lastStint);
  x.push(lastStint);
  const composeTT = (id: string): string[] => {
    const x = lookup.get(id);
    if (x !== undefined) {
      return [
        sprintf("Laps: %d (%d-%d)", x.numLaps, x.lapExit, x.lapEnter),
        sprintf("Duration: %s (%s-%s)", secAsString(x.stintTime), secAsString(x.exitTime), secAsString(x.enterTime)),
      ];
    } else return [];
  };
  return (
    <>
      <Row gutter={16}>
        <Col span={22}>
          <VictoryChart
            width={1500}
            height={200 + allCarNums.length * 25}
            standalone={true}
            theme={VictoryTheme.material}
            // domain={graphDomain}
            domainPadding={{ x: [20, 10], y: [50, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {x.map((item, idx) => (
                <VictoryBar
                  horizontal
                  // key={item[idx].id}
                  key={_.uniqueId()}
                  x="carNum"
                  y="stintTime"
                  data={item}
                  labels={({ datum }) => composeTT(datum.id)}
                  labelComponent={<VictoryTooltip />}
                />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintDuration;
