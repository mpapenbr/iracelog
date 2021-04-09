import { ResponsiveBar } from "@nivo/bar";
import { Empty, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { uiRaceStintSharedSettings } from "../../stores/ui/actions";
import { IStintInfo } from "../../stores/wamp/types";
import { secAsHHMMSS, secAsMMSS, sortCarNumberStr } from "../../utils/output";
import CarFilter from "../live/carFilter";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "../live/util";

interface IGraphData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const CarStintsNivo: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceStintSharedSettings);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();

  const maxStints = carStints.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const dataLookup = carStints.reduce((prev, cur) => {
    const stints = [...cur.history].concat(cur.current.isCurrentStint ? cur.current : []);
    prev.set(cur.carNum, stints);
    return prev;
  }, new Map<string, IStintInfo[]>());

  // console.log(x);
  const stintData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["Stint " + (idx + 1)]: v.stintTime }));
    }
    return { ...work };
  });

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

  // const pits: Map<string, number[]> = new Map();
  // pits.set("1", [12, 20, 14]);

  const pits = [
    { car: "#45", p1: 12, p2: 22, p3: 15 },
    { car: "#77", p1: 10 },
    { car: "#99", p1: 7, p2: 8, p3: 9 },
  ];
  const colorScale = ["Pink", "PaleGoldenrod", "LightGreen"];

  const CustomTooltip = (data: any) => {
    // we get something like this:
    /*
color: "#61cdbb"
data: {Pitstop 1: 140.6333333338498, Pitstop 2: 87.66666666539095, Pitstop 3: 73.79999999892607, Pitstop 4: 129.81666666477759, Pitstop 5: 77.66666666553647, …}
id: "Pitstop 5"
index: 11
indexValue: "12" // my car num
theme: {background: "transparent", fontFamily: "sans-serif", fontSize: 11, textColor: "#333333", axis: {…}, …}
value: 77.66666666553647
*/
    var matchRE = /Stint (\d+)/g;
    var match = matchRE.exec(data.id);
    const stintInfo = dataLookup.get(data.indexValue)!;

    const stintIdx = parseInt(match![1]) - 1;
    const item = stintInfo[stintIdx];
    return (
      <div>
        <strong>
          #{item.carNum} {data.id}
        </strong>
        <br />
        Lap {item.lapExit} - {item.lapEnter} ({item.lapEnter - item.lapExit + 1})
        <br />
        {secAsHHMMSS(item.exitTime)} - {secAsHHMMSS(item.enterTime)}
      </div>
    );
  };
  const InternalGraph = (
    // <div style={{ position: "relative" }}>
    //   <div style={{ position: "absolute", width: "100%", height: "100%" }}>
    //     Hallo
    <div style={{ height: "750px" }}>
      <ResponsiveBar
        data={stintData}
        keys={_.range(1, maxStints).map((i) => "Stint " + i)}
        indexBy="car"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        layout="horizontal"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        enableGridY={false}
        enableGridX={true}
        label={(d) => `${secAsMMSS(d.value as number)}`}
        animate={false}
        tooltip={(d) => CustomTooltip(d)}
        labelSkipWidth={20}
        axisLeft={{
          format: (value) => `#${value}`,
        }}
      />
    </div>
    //   </div>
    // </div>
  );

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
      {uiSettings.showCars.length === 0 ? <Empty description="Select cars" /> : InternalGraph}
    </>
  );
};

export default CarStintsNivo;
