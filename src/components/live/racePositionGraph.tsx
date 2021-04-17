import { Checkbox, Col, Empty, List, Row, Spin } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { VictoryChart, VictoryLine, VictoryTheme, VictoryVoronoiContainer } from "victory";
import { ApplicationState } from "../../stores";
import { uiRacePositionSettings } from "../../stores/ui/actions";
import { IRaceGraph } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";
import CarFilter from "./carFilter";
import { strokeColors } from "./colors";
import { computeAvailableCars, extractSomeCarData } from "./util";

interface IVicData {
  x: number;
  y: number;
}

const RacePositionGraph: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.racePositionSettings);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const dispatch = useDispatch();

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  if (wamp.raceGraph.length === 0) {
    return <Spin />;
  }

  const carClassesFromShowCars = _.uniq([
    uiSettings.showCars
      .map((carNum) => carInfoLookup.get(carNum)!.carClass)
      .filter((v) => "".localeCompare(v || "") === 0),
    "overall", // we need then allways
  ]).sort();
  const dataLookup = wamp.raceGraph.reduce((prev, cur) => {
    let entry = prev.get(cur.carClass);
    if (entry !== undefined) {
      prev.set(cur.carClass, entry.concat(cur));
    } else {
      prev.set(cur.carClass, [cur]);
    }
    return prev;
  }, new Map<string, IRaceGraph[]>());

  const dataForCar = (carNum: string) => {
    const source: IRaceGraph[] = dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined && carEntry.pos > 0 && carEntry.lapNo > 0) {
        prev.push({ x: current.lapNo, y: uiSettings.showPosInClass ? carEntry.pic : carEntry.pos });
      }
      return prev;
    }, [] as IVicData[]);
  };

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const onSelectShowCars = (value: any) => {
    dispatch(uiRacePositionSettings({ ...uiSettings, showCars: value as string[] }));
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
    dispatch(uiRacePositionSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const onFilterSecsChange = (value: any) => {
    // dispatch(uiRaceGraphSettings({ ...uiSettings, deltaRange: value }));
  };

  const onCheckboxChange = () => {
    dispatch(uiRacePositionSettings({ ...uiSettings, showPosInClass: !uiSettings.showPosInClass }));
  };

  const vvc = (
    <VictoryVoronoiContainer
      labels={({ datum }) => {
        return sprintf("L%d, Pos: %d", _.round(datum.x), datum.y);
      }}
    />
  );

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
          containerComponent={vvc}
        >
          {/* <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
<VictoryAxis />       */}

          {uiSettings.showCars.map((carNum, idx) => (
            <VictoryLine key={_.uniqueId()} data={dataForCar(carNum)} style={{ data: { stroke: colorCode(carNum) } }} />
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
          onSelectCarFilter={onSelectShowCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
        <Col span={3}>
          <Checkbox
            defaultChecked={uiSettings.showPosInClass}
            checked={uiSettings.showPosInClass}
            onChange={onCheckboxChange}
          >
            Show position in class
          </Checkbox>
        </Col>
      </Row>
      {uiSettings.showCars.length === 0 ? (
        <Empty description="Select single cars or car classes from the above selectors" />
      ) : (
        InternalRaceGraph
      )}
    </>
  );
};

export default RacePositionGraph;
