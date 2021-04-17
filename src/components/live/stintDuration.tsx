import { Col, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryStack, VictoryTheme, VictoryTooltip } from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceStintSharedSettings } from "../../stores/ui/actions";
import { IStintInfo } from "../../stores/wamp/types";
import { secAsString, sortCarNumberStr } from "../../utils/output";
import CarFilter from "./carFilter";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "./util";

interface IVicData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const StintDuration: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);

  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceStintSharedSettings);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();
  interface ILookup<T> {
    id: string;
    value: T;
  }
  // let lookup = carStints.map((v) => ({ id: _.uniqueId(), data: v.current }));
  let lookup = new Map<string, IStintInfo>();
  // console.log(lookup);

  const maxPitstops = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const x = _.range(maxPitstops).map((idx) => {
    return carOrder.map((carNum) => {
      const found = carStints.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        const id = _.uniqueId();
        lookup.set(id, found!.history[idx]);
        return { id: id, carNum: carNum, stintTime: found!.history[idx].stintTime };
      } else return { id: "", carNum: carNum, stintTime: 0 };
    });
  });
  // console.log(x);
  const lastStint = carOrder.map((carNum, idx) => {
    const foundPit = carStints.find((v) => v.carNum === carNum);
    if (foundPit?.current.isCurrentStint) {
      const id = _.uniqueId();
      lookup.set(id, foundPit!.current);
      return { id: id, carNum: carNum, stintTime: foundPit!.current.stintTime };
    } else return { id: "", carNum: carNum, stintTime: 0 };
  });
  // console.log(lastStint);
  x.push(lastStint);
  const composeTT = (id: string): string[] => {
    const x = lookup.get(id);
    if (x !== undefined) {
      return [
        sprintf("Laps: %d (%d-%d)", x.numLaps, x.lapExit, x.lapEnter),
        sprintf("Duration: %s (%s-%s)", secAsString(x.stintTime), secAsString(x.exitTime), secAsString(x.enterTime)),
      ];
    } else return [];
  };

  const onSelectShowCars = (value: any) => {
    dispatch(uiRaceStintSharedSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(uiRaceStintSharedSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  return (
    <>
      <Row>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectShowCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
      </Row>
      <Row gutter={16}>
        <Col span={22}>
          <VictoryChart
            width={1500}
            height={200 + allCarNums.length * 25}
            standalone={true}
            theme={VictoryTheme.material}
            // domain={graphDomain}
            domainPadding={{ x: [20, 10], y: [50, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={carOrder} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {x.map((item, idx) => (
                <VictoryBar
                  horizontal
                  // key={item[idx].id}
                  key={_.uniqueId()}
                  x="carNum"
                  y="stintTime"
                  data={item}
                  labels={({ datum }) => composeTT(datum.id)}
                  labelComponent={<VictoryTooltip />}
                />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintDuration;
