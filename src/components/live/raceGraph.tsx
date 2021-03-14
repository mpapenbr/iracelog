import { Checkbox, Col, List, Row, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { isNumber } from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";

interface IVicData {
  x: number;
  y: number;
}

const RaceGraph: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const allCarNums = raceGraph.length > 0 ? wamp.raceGraph[0].gaps.map((v) => v.carNum).sort() : [];
  const [showCars, setShowCars] = useState(allCarNums);
  if (wamp.raceGraph.length === 0) {
    return <Spin />;
  }
  const dataForCar = (carNum: string) => {
    return wamp.raceGraph.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap)) {
          prev.push({ x: current.lapNo, y: carEntry.gap });
        }
      }
      return prev;
    }, [] as IVicData[]);
  };

  const isShowCar = (s: string): boolean => {
    return showCars.findIndex((v) => s === v) !== -1;
  };
  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const toggleShowCar = (e: CheckboxChangeEvent) => {
    console.log(e);
    if (e.target.checked) {
      const work = showCars.slice();
      work.push(e.target.value!);
      setShowCars(work);
    } else {
      const idx = showCars.findIndex((v) => v == e.target.value);
      if (idx !== -1) {
        const work = showCars.slice();
        work.splice(idx, 1);
        setShowCars(work);
      }
    }
  };
  // from https://www.w3schools.com/lib/w3-colors-2021.css
  const strokeColors = [
    "#FDAC53",
    "#9BB7D4",
    "#B55A30",
    "#F5DF4D",
    "#0072B5",
    "#A0DAA9",
    "#E9897E",
    "#00A170",
    "#926AA6",
    "#D2386C",
    "#363945",
    "#939597",
    "#EFE1CE",
    "#E0B589",
    "#9A8B4F",
  ];
  return (
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
          {/* <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
      <VictoryAxis />       */}

          {allCarNums.filter(isShowCar).map((carNum, idx) => (
            <VictoryLine data={dataForCar(carNum)} style={{ data: { stroke: colorCode(carNum) } }} />
          ))}
        </VictoryChart>
      </Col>
      <Col>
        <List
          size="small"
          dataSource={allCarNums}
          renderItem={(item, idx) => (
            <List.Item>
              <Checkbox
                value={item}
                checked={isShowCar(item)}
                onChange={toggleShowCar}
                style={{ color: colorCode(item) }}
              >
                #{item}
              </Checkbox>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

export default RaceGraph;
