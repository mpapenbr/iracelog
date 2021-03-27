import { Col, Empty, List, Row, Spin } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceGraphSettings } from "../../stores/ui/actions";
import { sortCarNumberStr } from "../../utils/output";
import CarFilter from "./carFilter";
import { strokeColors } from "./colors";
import { computeAvailableCars, extractSomeCarData } from "./util";

interface IVicData {
  x: number;
  y: number;
}

const RaceGraph: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceGraphSettings);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

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

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const onSelectCompareCars = (value: any) => {
    dispatch(uiRaceGraphSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const removedClasses = new Set(_.difference(uiSettings.filterCarClasses, value));
    _.remove(uiSettings.showCars, (carNum) => removedClasses.has(carDataContainer.carInfoLookup.get(carNum)!.carClass));
    // get added car classes
    const addedClasses = new Set(_.difference(value, uiSettings.filterCarClasses));
    let newShowcars = _.concat(
      uiSettings.showCars,
      carDataContainer.allCarNums.filter((carNum) =>
        addedClasses.has(carDataContainer.carInfoLookup.get(carNum)!.carClass)
      )
    );
    newShowcars = _.uniq(newShowcars).sort(sortCarNumberStr);
    dispatch(uiRaceGraphSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const onFilterSecsChange = (value: any) => {
    // dispatch(uiRaceGraphSettings({ ...uiSettings, deltaRange: value }));
  };

  const InternalRaceGraph = (
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
    </Row>
  );

  return (
    <>
      <Row gutter={16}>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectCompareCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
      </Row>
      {uiSettings.showCars.length === 0 ? (
        <Empty description="Select single cars or car classes from the above selectors" />
      ) : (
        InternalRaceGraph
      )}
    </>
  );
};

export default RaceGraph;
