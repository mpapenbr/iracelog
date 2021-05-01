import { ResponsiveBar } from "@nivo/bar";
import { Empty, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { pitstopsSettings } from "../../stores/ui/actions";
import { ICarPitInfo, IPitInfo } from "../../stores/wamp/types";
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
const CarPitstopsNivo: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.pitstops);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();

  const numEntries = (item: ICarPitInfo) => item.history.length + (item.current.isCurrentPitstop ? 1 : 0);
  const maxPitstops = carPits.reduce((a, b) => (numEntries(b) > a ? numEntries(b) : a), 0);

  const dataLookup = carPits.reduce((prev, cur) => {
    const pitstops = [...cur.history].concat(cur.current.isCurrentPitstop ? cur.current : []);
    prev.set(cur.carNum, pitstops);
    return prev;
  }, new Map<string, IPitInfo[]>());

  // console.log(x);
  const pitData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["Pitstop " + (idx + 1)]: v.laneTime }));
    }
    return { ...work };
  });

  const onSelectShowCars = (value: any) => {
    dispatch(pitstopsSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(pitstopsSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
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
    var matchRE = /Pitstop (\d+)/g;
    var match = matchRE.exec(data.id);
    const pitInfo = dataLookup.get(data.indexValue)!;

    const pitIdx = parseInt(match![1]) - 1;
    return (
      <div>
        <strong>
          #{pitInfo[pitIdx].carNum} {data.id}
        </strong>
        <br />
        Lap {pitInfo[pitIdx].lapEnter} at {secAsHHMMSS(pitInfo[pitIdx].enterTime)}
      </div>
    );
  };
  const InternalGraph = (
    // <div style={{ position: "relative" }}>
    //   <div style={{ position: "absolute", width: "100%", height: "100%" }}>
    //     Hallo
    <div style={{ height: "750px" }}>
      <ResponsiveBar
        data={pitData}
        keys={_.range(1, maxPitstops + 1).map((i) => "Pitstop " + i)}
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

export default CarPitstopsNivo;
