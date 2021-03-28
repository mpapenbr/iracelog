import { Col, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryStack,
  VictoryTheme,
  VictoryThemeDefinition,
} from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceStintSharedSettings } from "../../stores/ui/actions";
import { IStintInfo } from "../../stores/wamp/types";
import { sortCarNumberStr } from "../../utils/output";
import CarFilter from "./carFilter";
import { computeAvailableCars, extractSomeCarData } from "./util";

interface IVicData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const StintLaps: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceStintSharedSettings);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  // const allCarNums =
  //   carStints.length > 0
  //     ? wamp.carStints
  //         .map((v) => v.carNum)
  //         .sort(sortCarNumberStr)
  //         .reverse() // we want the lowest number to be at the top
  //     : [];
  // console.log(allCarNums);
  const maxPitstops = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  let lookup = new Map<string, IStintInfo>();

  const carOrder = [...uiSettings.showCars].sort().reverse();
  const stackerData = _.range(maxPitstops).map((idx) => {
    return carOrder.map((carNum) => {
      const found = carStints.find((v) => v.carNum === carNum);
      if (idx < found!.history.length) {
        const id = _.uniqueId();
        lookup.set(id, found!.history[idx]);
        return { id: id, carNum: carNum, numLaps: found!.history[idx].numLaps };
      } else return { id: "", carNum: carNum, numLaps: 0 };
    });
  });
  const lastStint = uiSettings.showCars.map((carNum, idx) => {
    const foundStint = carStints.find((v) => v.carNum === carNum);
    if (foundStint?.current.isCurrentStint) {
      const id = _.uniqueId();
      lookup.set(id, foundStint!.current);
      return { id: id, carNum: carNum, numLaps: foundStint!.current.numLaps };
    } else return { id: "", carNum: carNum, numLaps: 0 };
  });

  stackerData.push(lastStint);

  const onSelectShowCars = (value: any) => {
    dispatch(uiRaceStintSharedSettings({ ...uiSettings, showCars: value as string[] }));
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
    dispatch(uiRaceStintSharedSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  const myTheme: VictoryThemeDefinition = {
    ...VictoryTheme.material,
    stack: {
      //colorScale: ["#f7b792", "#f28b50"],
      colorScale: ["lightgreen", "SandyBrown", "lightyellow"],
    },
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
            height={300 + uiSettings.showCars.length * 20}
            standalone={true}
            theme={myTheme}
            // domain={graphDomain}
            domainPadding={{ x: [20, 10], y: [0, 0] }}
            // containerComponent={vvc}
          >
            <VictoryAxis tickValues={carOrder} />
            <VictoryAxis dependentAxis />
            <VictoryStack>
              {stackerData.map((item, idx) => (
                <VictoryBar
                  horizontal
                  key={_.uniqueId()}
                  x="carNum"
                  y="numLaps"
                  data={item}
                  labels={({ datum }) => sprintf("%d", datum.numLaps !== undefined ? datum.numLaps : 0)}
                  labelComponent={
                    <VictoryLabel
                      dx={-20}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      // text={({ datum }) => sprintf("%d", idx)}
                    />
                  }
                />
              ))}
            </VictoryStack>
          </VictoryChart>
        </Col>
      </Row>
    </>
  );
};

export default StintLaps;
