import { Checkbox, Col, Empty, InputNumber, List, Row, Select } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import _ from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { VictoryChart, VictoryScatter, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";
import { strokeColors } from "./colors";

interface IVicData {
  x: number;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const DriverLaps: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carLaps = useSelector((state: ApplicationState) => state.wamp.data.carLaps);
  const allCarNums = carLaps.length > 0 ? wamp.carLaps.map((v) => v.carNum).sort() : [];
  const [referenceCar, setReferenceCar] = useState();
  const [showCars, setShowCars] = useState([] as string[]);
  const [filterSecs, setFilterSecs] = useState(20);
  const dataForCar = (carNum: string): IVicData[] => {
    const found = carLaps.find((v) => v.carNum === carNum);
    if (found !== undefined) {
      const getValue = (v: any): number => {
        if (typeof v === "number") return v;
        else {
          const [vx, info] = v;
          return vx;
        }
      };

      return found.laps.map((v) => ({ x: v.lapNo, y: getValue(v.lapTime) }));
    } else return [];
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
        const idx = allCarNums.findIndex((v) => v === value);
        if (idx !== -1) {
          let work = [];
          if (idx - 1 >= 0) {
            work.push(allCarNums[idx - 1]);
          }
          if (idx + 1 <= allCarNums.length) {
            work.push(allCarNums[idx + 1]);
          }
          setShowCars(work);
        }
      }
    }
  };

  const onFilterSecsChange = (value: any) => {
    console.log(value);
    setFilterSecs(value as number);
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
          <Empty description="Select car" />
        ) : (
          <>
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
                  <VictoryScatter
                    key={_.uniqueId()}
                    data={dataForCar(carNum)}
                    style={{ data: { fill: colorCode(carNum) } }}
                  />
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

export default DriverLaps;
