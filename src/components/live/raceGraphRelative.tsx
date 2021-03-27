import { Col, Empty, InputNumber, List, Row, Select } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { DomainTuple, VictoryChart, VictoryLine, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceGraphRelativeSettings } from "../../stores/ui/actions";
import { IRaceGraph } from "../../stores/wamp/types";
import CarFilter from "./carFilter";
import { strokeColors } from "./colors";
import { computeAvailableCars, extractSomeCarData } from "./util";

interface IVicData {
  x: number;
  y: number;
}

const { Option } = Select;

const RaceGraphByReference: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const raceOrder = useSelector((state: ApplicationState) => state.wamp.data.raceOrder);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceGraphRelativeSettings);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const dataForCar = (carNum: string) => {
    return wamp.raceGraph.reduce((prev, current) => {
      const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined && refCarEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap)) {
          prev.push({ x: current.lapNo, y: carEntry.gap - refCarEntry.gap });
        }
      }
      return prev;
    }, [] as IVicData[]);
  };

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const referenceOptions = availableCars.map((d) => (
    <Option key={_.uniqueId()} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  const onSelectReferenceCar = (value: any) => {
    dispatch(uiRaceGraphRelativeSettings({ ...uiSettings, referenceCarNum: value as string }));
  };

  const onSelectCompareCars = (value: any) => {
    dispatch(uiRaceGraphRelativeSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: any) => {
    dispatch(uiRaceGraphRelativeSettings({ ...uiSettings, filterCarClasses: value as string[] }));
  };

  const onFilterSecsChange = (value: any) => {
    dispatch(uiRaceGraphRelativeSettings({ ...uiSettings, deltaRange: value }));
  };

  /*
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
*/

  const calcXDom = (rg: IRaceGraph[]): DomainTuple => {
    if (rg.length === 0) return [0, 0];

    return [rg[0].lapNo, _.last(rg)?.lapNo || 0];
  };
  const graphDomain = {
    x: calcXDom(raceGraph),
    y: [-uiSettings.deltaRange, uiSettings.deltaRange] as DomainTuple,
  };
  // from https://www.w3schools.com/lib/w3-colors-2021.css

  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={uiSettings.referenceCarNum}
            placeholder="Select reference car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectCompareCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
        <Col span={4}>
          <InputNumber
            defaultValue={uiSettings.deltaRange}
            precision={0}
            step={10}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        {uiSettings.referenceCarNum === "" ? (
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

                {uiSettings.showCars.map((carNum, idx) => (
                  <VictoryLine data={dataForCar(carNum)} style={{ data: { stroke: colorCode(carNum) } }} />
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

export default RaceGraphByReference;
