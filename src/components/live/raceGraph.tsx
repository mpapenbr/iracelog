import { Checkbox, Col, Empty, List, Row, Spin } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { VictoryChart, VictoryLine, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceGraphSettings } from "../../stores/ui/actions";
import { IRaceGraph } from "../../stores/wamp/types";
import { lapTimeString } from "../../utils/output";
import CarFilter from "./carFilter";
import { strokeColors } from "./colors";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "./util";

interface IVicData {
  x: number;
  y: number;
  id: string;
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
    const source: IRaceGraph[] =
      uiSettings.gapRelativeToClassLeader && allCarClasses.length > 0
        ? dataLookup.get(carInfoLookup.get(carNum)!.carClass)!
        : dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap)) {
          prev.push({ x: current.lapNo, y: carEntry.gap, id: _.uniqueId() });
        }
      }
      return prev;
    }, [] as IVicData[]);
  };

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const onSelectShowCars = (value: any) => {
    dispatch(uiRaceGraphSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(uiRaceGraphSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const onCheckboxChange = () => {
    dispatch(uiRaceGraphSettings({ ...uiSettings, gapRelativeToClassLeader: !uiSettings.gapRelativeToClassLeader }));
  };

  const vvc = (
    <VictoryVoronoiContainer
    // labels={({ datum }) => {
    //   return sprintf("L%d, Delta: %.02f", _.round(datum.x), datum.y);
    // }}
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
            <VictoryLine
              key={_.uniqueId()}
              data={dataForCar(carNum)}
              labels={(d: any) => ["Lap " + d.datum.x, "Gap " + lapTimeString(d.datum.y), d.datum.id]}
              style={{ data: { stroke: colorCode(carNum) } }}
              labelComponent={<VictoryTooltip />}
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
            defaultChecked={uiSettings.gapRelativeToClassLeader}
            checked={uiSettings.gapRelativeToClassLeader}
            onChange={onCheckboxChange}
          >
            Gaps relative to class leader
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

export default RaceGraph;
