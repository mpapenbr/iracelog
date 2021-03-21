import { Checkbox, Col, Empty, InputNumber, List, Row, Select } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import _, { isNumber } from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { DomainTuple, VictoryChart, VictoryLine, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";
import { IRaceGraph } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";
import { strokeColors } from "./colors";

interface IVicData {
  x: number;
  y: number;
}

const { Option } = Select;

const RaceGraphByReference: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const raceOrder = useSelector((state: ApplicationState) => state.wamp.data.raceOrder);
  const allCarNums = raceGraph.length > 0 ? wamp.raceGraph[0].gaps.map((v) => v.carNum).sort(sortCarNumberStr) : [];
  const [referenceCar, setReferenceCar] = useState();
  const [showCars, setShowCars] = useState([] as string[]);
  const [filterSecs, setFilterSecs] = useState(20);
  const dataForCar = (carNum: string) => {
    return wamp.raceGraph.reduce((prev, current) => {
      const refCarEntry = current.gaps.find((gi) => gi.carNum === referenceCar);
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined && refCarEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap)) {
          prev.push({ x: current.lapNo, y: carEntry.gap - refCarEntry.gap });
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

  const referenceOptions = allCarNums.map((d) => (
    <Option key={_.uniqueId()} value={d}>
      #{d}
    </Option>
  ));

  const onSelectReference = (value: any) => {
    if (value !== undefined) {
      setReferenceCar(value);
      if (showCars.length == 0) {
        const idx = raceOrder.findIndex((v) => v === value);

        if (idx !== -1) {
          let work = [];
          let leftSide = idx - 2;
          let rightSide = idx + 2;
          if (leftSide < 0) {
            rightSide = Math.min(raceOrder.length - 1, rightSide + Math.abs(leftSide));
            leftSide = 0;
          }
          if (rightSide > raceOrder.length - 1) {
            leftSide = Math.max(0, leftSide - (rightSide - raceOrder.length));
            rightSide = raceOrder.length - 1;
          }
          console.log("leftSide: " + leftSide + " rightSide: " + rightSide);
          work = raceOrder.slice(leftSide, rightSide + 1);
          setShowCars(work);
        }
      }
    }
  };

  const onFilterSecsChange = (value: any) => {
    console.log(value);
    setFilterSecs(value as number);
  };

  const calcXDom = (rg: IRaceGraph[]): DomainTuple => {
    if (rg.length === 0) return [0, 0];

    return [rg[0].lapNo, _.last(rg)?.lapNo || 0];
  };
  const graphDomain = {
    x: calcXDom(raceGraph),
    y: [-filterSecs, filterSecs] as DomainTuple,
  };
  // from https://www.w3schools.com/lib/w3-colors-2021.css

  return (
    <>
      <Row gutter={16}>
        <Col span={10}>
          <Select style={{ width: "100%" }} allowClear placeholder="Select reference car" onChange={onSelectReference}>
            {referenceOptions}
          </Select>
        </Col>
        <Col span={4}>
          <InputNumber
            defaultValue={filterSecs}
            precision={0}
            step={10}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? v.replace("sec", "") : "")}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        {referenceCar === undefined ? (
          <Empty description="Select reference car" />
        ) : (
          <>
            <Col span={22}>
              <VictoryChart
                width={1000}
                height={500}
                standalone={true}
                theme={VictoryTheme.grayscale}
                domain={graphDomain}
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
          </>
        )}
      </Row>
    </>
  );
};

export default RaceGraphByReference;
