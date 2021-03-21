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
import { secAsString, sortCarNumberStr } from "../../utils/output";

interface IVicData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const CarPitstops: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const allCarNums =
    carPits.length > 0
      ? wamp.carPits
          .map((v) => v.carNum)
          .sort(sortCarNumberStr)
          .reverse()
      : [];

  const maxPitstops = carPits.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const dataForCar = (carNum: string): any => {
    const found = carPits.find((v) => v.carNum === carNum);
    if (found !== undefined) {
      const getValue = (v: any): number => {
        if (typeof v === "number") return v;
        else {
          const [vx, info] = v;
          return vx;
        }
      };

      const ret = found.history.map((v, idx) => ({ x: carNum, y: v.laneTime }));
      // console.log(ret);
    } else return [];
  };

  const x = _.range(maxPitstops).map((idx) => {
    return allCarNums.map((carNum) => {
      const found = carPits.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        return found!.history[idx];
      } else return { carNum: carNum, laneTime: 0, stintTime: 0 };
    });
  });
  // console.log(x);
  allCarNums.map((carNum) => dataForCar(carNum));
  const dataForCar2 = (carNum: string): any => {
    const found = carPits.find((v) => v.carNum === carNum);
    return found != undefined ? found.history.map((v, idx) => ({ p: idx, ...v })) : [];
  };

  // const calcXDom = (rg: ICarLaps): DomainTuple => {
  //   if (rg.length === 0) return [0, 0];

  //   return [rg[0], _.last(rg)?.lapNo || 0];
  // };
  // const graphDomain = {
  //   x: calcXDom(carLaps),
  //   y: [-filterSecs, filterSecs] as DomainTuple,
  // };
  // from https://www.w3schools.com/lib/w3-colors-2021.css
  const myTheme: VictoryThemeDefinition = {
    ...VictoryTheme.material,
    stack: {
      // colorScale: ["#68af60", "#86be83"],
      colorScale: ["Pink", "PaleGoldenrod", "LightGreen"],
    },
  };
  return (
    <>
      <Row gutter={16}>
        <Col span={22}>
          <VictoryChart
            width={1500}
            height={200 + allCarNums.length * 25}
            standalone={true}
            // theme={VictoryTheme.material}
            theme={myTheme}
            // domain={graphDomain}
            domainPadding={{ x: [10, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {x.map((item, idx) => (
                <VictoryBar
                  horizontal
                  key={_.uniqueId()}
                  x="carNum"
                  y="laneTime"
                  data={item}
                  labels={({ datum }) => sprintf("%s", secAsString(datum.laneTime))}
                  labelComponent={
                    <VictoryLabel
                      dx={-20}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      // text={({ datum }) => sprintf("%s", secAsString(datum.laneTime))}
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

export default CarPitstops;
