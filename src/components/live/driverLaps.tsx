import { Col, Empty, InputNumber, List, Row, Select } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import {
  createContainer,
  DomainTuple,
  VictoryAxis,
  VictoryChart,
  VictoryCursorContainer,
  VictoryLabel,
  VictoryScatter,
  VictoryTheme,
  VictoryVoronoiContainer,
  VictoryZoomContainer,
} from "victory";
import { ApplicationState } from "../../stores";
import { ICarInfo } from "../../stores/wamp/types";
import { lapTimeString, lapTimeStringTenths, sortCarNumberStr } from "../../utils/output";
import { strokeColors } from "./colors";

interface IVicData {
  x: number;
  y: number;
}

const { Option } = Select;

const DriverLaps: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carLaps = useSelector((state: ApplicationState) => state.wamp.data.carLaps);
  const carInfo = useSelector((state: ApplicationState) => state.wamp.data.carInfo);
  const carInfoLookup = carInfo.reduce((m, cur) => {
    return m.set(cur.carNum, cur);
  }, new Map<string, ICarInfo>());

  const allCarNums = carLaps.length > 0 ? wamp.carLaps.map((v) => v.carNum).sort(sortCarNumberStr) : [];
  const [referenceCar, setReferenceCar] = useState();
  const [showCars, setShowCars] = useState([] as string[]);
  const [filterSecs, setFilterSecs] = useState(2);
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

  let carDataLookup = new Map<string, IVicData[]>();
  showCars.forEach((carNum) => carDataLookup.set(carNum, dataForCar(carNum)));

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const referenceOptions = allCarNums.map((d) => (
    <Option key={_.uniqueId()} value={d}>
      #{d} {carInfoLookup.get(d)?.name}
    </Option>
  ));

  const onSelectReferenceByTags = (value: any, option: any) => {
    setShowCars(value as string[]);
  };

  const onFilterSecsChange = (value: any) => {
    console.log(value);
    setFilterSecs(value as number);
  };

  const calcXDom = (): DomainTuple => {
    const ret = showCars.reduce(
      (prev, cur) => {
        const data = carDataLookup.get(cur)!;
        const lMin = Math.min(...data.map((v) => v.x));
        const lMax = Math.max(...data.map((v) => v.x));
        return [Math.min(lMin, prev[0]), Math.max(lMax, prev[1])];
      },
      [0, 0]
    );
    return [ret[0], ret[1]];
  };

  const calcYDom = (): DomainTuple => {
    const ret = showCars.reduce(
      (prev, cur) => {
        const data = carDataLookup.get(cur)!;
        const lMin = Math.min(...data.map((v) => v.y));
        const lMax = Math.max(...data.map((v) => v.y));
        const sum = data.reduce((prev, cur) => {
          return prev + cur.y;
        }, 0);

        return [prev[0] + sum, prev[1] + data.length];
      },
      [0, 0]
    );
    const avg = ret[0] / ret[1];
    return [avg - filterSecs, avg + filterSecs];
  };

  const graphDomain = {
    x: calcXDom(),
    y: calcYDom(),
  };
  console.log(graphDomain);
  // from https://www.w3schools.com/lib/w3-colors-2021.css
  const vvc = (
    <VictoryVoronoiContainer
      labels={({ datum }) => {
        return sprintf("Lap %d, Time: %s", _.round(datum.x), lapTimeString(datum.y));
      }}
    />
  );
  const vcv = (
    <VictoryCursorContainer
      cursorDimension="x"
      cursorLabelComponent={<VictoryLabel />}
      cursorLabel={(props: any) => {
        return sprintf("Lap %d, Time: %s", _.round(props.datum.x), lapTimeString(props.datum.y));
      }}
    />
  );

  // TS-Probs? If not any I can't add it as containerComponent. Properties are also a problem! (see (d:any) in labels)
  const CombinedContainer: any = createContainer<VictoryVoronoiContainer, VictoryZoomContainer>("voronoi", "zoom");

  return (
    <>
      <Row gutter={16}>
        <Col span={10}>
          <Select
            style={{ width: "100%" }}
            mode="tags"
            allowClear
            placeholder="Select reference car"
            onChange={onSelectReferenceByTags}
          >
            {referenceOptions}
          </Select>
        </Col>
        <Col span={4}>
          <InputNumber
            defaultValue={filterSecs}
            precision={0}
            step={1}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? v.replace("sec", "") : "")}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        {showCars.length === 0 ? (
          <Empty description="Select car" />
        ) : (
          <>
            <Col span={22}>
              <VictoryChart
                width={1500}
                height={500}
                standalone={true}
                theme={VictoryTheme.grayscale}
                domain={graphDomain}
                domainPadding={{ x: [10, 0], y: [10, 0] }}
                containerComponent={
                  <CombinedContainer
                    labels={(d: any) => {
                      return sprintf("Lap %d, Time: %s", _.round(d.datum.x), lapTimeString(d.datum.y));
                    }}
                  />
                }
                // containerComponent={vvc}
              >
                <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
                <VictoryAxis />

                {showCars.map((carNum, idx) => (
                  <VictoryScatter
                    key={_.uniqueId()}
                    data={carDataLookup.get(carNum)}
                    style={{ data: { fill: colorCode(carNum) } }}
                  />
                ))}
              </VictoryChart>
            </Col>
            <Col>
              <List
                size="small"
                dataSource={showCars}
                renderItem={(item, idx) => <List.Item style={{ color: colorCode(item) }}>#{item}</List.Item>}
              />
            </Col>
          </>
        )}
      </Row>
    </>
  );
};

export default DriverLaps;
