import { Col, Empty, InputNumber, List, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { uiDriverLapsSettings } from "../../stores/ui/actions";
import { lapTimeString, lapTimeStringTenths } from "../../utils/output";
import CarFilter from "./carFilter";
import { strokeColors } from "./colors";
import { computeAvailableCars, extractSomeCarData } from "./util";

interface IVicData {
  x: number;
  y: number;
}

const { Option } = Select;

const DriverLaps: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carLaps = useSelector((state: ApplicationState) => state.wamp.data.carLaps);
  const carInfo = useSelector((state: ApplicationState) => state.wamp.data.carInfo);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.driverLapsSettings);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);
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
  uiSettings.showCars.forEach((carNum) => carDataLookup.set(carNum, dataForCar(carNum)));

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const onSelectReferenceByTags = (value: any) => {
    dispatch(uiDriverLapsSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: any) => {
    dispatch(uiDriverLapsSettings({ ...uiSettings, filterCarClasses: value as string[] }));
  };

  const onFilterSecsChange = (value: any) => {
    dispatch(uiDriverLapsSettings({ ...uiSettings, filterSecs: value }));
  };

  const calcXDom = (): DomainTuple => {
    const ret = uiSettings.showCars.reduce(
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
    const cur = uiSettings.showCars.reduce((prev, cur) => {
      const data = carDataLookup.get(cur)!;
      return prev.concat(data.map((v) => v.y));
    }, [] as number[]);

    if (cur.length > 0) {
      cur.sort();
      const median = cur[cur.length >> 1];
      return [cur[0], median + uiSettings.filterSecs];
    } else {
      return [0, 0];
    }
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
        return sprintf("L%d, %s", _.round(datum.x), lapTimeString(datum.y));
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
  const CombinedContainer = createContainer<VictoryVoronoiContainer, VictoryZoomContainer>("voronoi", "brush");

  const cc = vvc;
  return (
    <>
      <Row gutter={16}>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectReferenceByTags}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
        <Col span={4}>
          <InputNumber
            defaultValue={uiSettings.filterSecs}
            precision={0}
            step={1}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        {uiSettings.showCars.length === 0 ? (
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
                containerComponent={cc}
                // containerComponent={vvc}
              >
                <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
                <VictoryAxis />

                {uiSettings.showCars.map((carNum, idx) => (
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
                dataSource={uiSettings.showCars}
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
