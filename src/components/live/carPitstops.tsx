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
const CarPitstops: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const allCarNums = carPits.length > 0 ? wamp.carPits.map((v) => v.carNum).sort() : [];
  console.log(allCarNums);
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
      console.log(ret);
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
  console.log(x);
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
            domainPadding={{ x: [10, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={allCarNums} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {x.map((item, idx) => (
                <VictoryBar horizontal key={_.uniqueId()} x="carNum" y="laneTime" data={item} />
              ))}
              {/* <VictoryBar
                key={_.uniqueId()}
                x="p"
                y="laneTime"
                data={[
                  { p: 1, laneTime: 10 },
                  { p: 2, laneTime: 20 },
                  { p: 4, laneTime: 40 },
                ]}
              />
              <VictoryBar
                key={_.uniqueId()}
                x="p"
                y="laneTime"
                data={[
                  { p: 1, laneTime: 40 },
                  { p: 2, laneTime: 10 },
                  { p: 3, laneTime: 10 },
                  { p: 4, laneTime: 40 },
                ]}
              /> */}
              {/* <VictoryBar key={_.uniqueId()} x="p" y="laneTime" data={dataForCar2("02")} /> */}
              {/* <VictoryBar key={_.uniqueId()} x={2} y="laneTime" data={dataForCar2("1")} /> */}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default CarPitstops;
