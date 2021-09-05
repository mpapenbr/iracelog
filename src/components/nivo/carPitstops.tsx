import { ResponsiveBar, ResponsiveBarCanvas } from "@nivo/bar";
import { Empty, Select } from "antd";
import _ from "lodash";
import React from "react";
import { ICarPitInfo, IPitInfo } from "../../stores/wamp/types";
import { secAsHHMMSS, secAsMMSS, sortCarNumberStr } from "../../utils/output";

const { Option } = Select;

interface MyProps {
  carPits: ICarPitInfo[];
  showCars: string[];
  hideLongPitstops: boolean;
  hideThreshold: number;
}
const CarPitstopsNivo: React.FC<MyProps> = (props: MyProps) => {
  // const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  // const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  // const uiSettings = useSelector((state: ApplicationState) => state.userSettings.pitstops);

  const carOrder = [...props.showCars].sort(sortCarNumberStr).reverse();

  const numEntries = (item: ICarPitInfo) => item.history.length + (item.current.isCurrentPitstop ? 1 : 0);
  const maxPitstops = props.carPits.reduce((a, b) => (numEntries(b) > a ? numEntries(b) : a), 0);

  const dataLookup = props.carPits.reduce((prev, cur) => {
    const pitstops = [...cur.history].concat(cur.current.isCurrentPitstop ? cur.current : []);
    prev.set(cur.carNum, pitstops);
    return prev;
  }, new Map<string, IPitInfo[]>());

  // console.log(x);
  const isLongPitstop = (pit: IPitInfo): boolean => {
    return pit.laneTime > props.hideThreshold;
  };

  const pitData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    if (carData !== undefined) {
      carData
        // TODO: soll nur den letzten STopp betrachten
        .filter((v, idx) => (props.hideLongPitstops ? (idx === carData.length - 1 ? !isLongPitstop(v) : true) : true))
        .forEach((v, idx) => (work = { ...work, ["Pitstop " + (idx + 1)]: v.laneTime }));
    }
    return { ...work };
  });
  console.log(pitData);
  const guessNumToDraw = props.carPits
    .filter((v) => props.showCars.includes(v.carNum))
    .reduce((prev, cur) => {
      return prev + cur.history.length + 1;
    }, 0);

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
    const matchRE = /Pitstop (\d+)/g;
    const match = matchRE.exec(data.id);
    const pitInfo = dataLookup.get(data.indexValue)!;

    const pitIdx = parseInt(match![1]) - 1;
    return (
      <div style={{ background: "white" }}>
        <strong>
          #{pitInfo[pitIdx].carNum} {data.id}
        </strong>
        <br />
        Lap {pitInfo[pitIdx].lapEnter} at {secAsHHMMSS(pitInfo[pitIdx].enterTime)}
      </div>
    );
  };

  const graphProps = {
    data: pitData,
    keys: _.range(1, maxPitstops + 1).map((i) => "Pitstop " + i),
    indexBy: "car",
    label: (d: any) => `${secAsMMSS(d.value as number)}`,
    tooltip: (d: any) => CustomTooltip(d),
    enableGridY: false,
    enableGridX: false,
    margin: { top: 20, right: 130, bottom: 50, left: 60 },
    labelSkipWidth: 20,
    axisLeft: { format: (value: any) => `#${value}` },
    // the following props don't get recognized. error message is like: "string" not valid here
    // layout: "horizontal",
    // valueScale: {type: "linear"  },
    // indexScale: {type: "band", round:true},
  };
  const calcHeight = Math.min(1200, Math.max(150, pitData.length * 30));
  const InternalGraph = (
    <div style={{ height: `${calcHeight}px` }}>
      {guessNumToDraw > 300 ? (
        // Canvas looks a little blurry, so we use it only when we think the standard way would take too long
        <ResponsiveBarCanvas
          {...graphProps}
          layout="horizontal"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
        />
      ) : (
        <ResponsiveBar
          animate={false}
          {...graphProps}
          layout="horizontal"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
        />
      )}
    </div>
  );

  return <>{props.showCars.length === 0 ? <Empty description="Select cars" /> : InternalGraph}</>;
};

export default CarPitstopsNivo;
