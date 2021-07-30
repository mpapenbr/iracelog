import { ResponsiveBar } from "@nivo/bar";
import { Empty, Select } from "antd";
import _ from "lodash";
import React from "react";
import { ICarPitInfo, IPitInfo } from "../../stores/wamp/types";
import { secAsHHMMSS, secAsMMSS, sortCarNumberStr } from "../../utils/output";

const { Option } = Select;

interface MyProps {
  carPits: ICarPitInfo[];
  showCars: string[];
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
  const pitData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["Pitstop " + (idx + 1)]: v.laneTime }));
    }
    return { ...work };
  });

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
      <div style={{ background: "white" }}>
        <strong>
          #{pitInfo[pitIdx].carNum} {data.id}
        </strong>
        <br />
        Lap {pitInfo[pitIdx].lapEnter} at {secAsHHMMSS(pitInfo[pitIdx].enterTime)}
      </div>
    );
  };
  const InternalGraph = (
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
  );

  return <>{props.showCars.length === 0 ? <Empty description="Select cars" /> : InternalGraph}</>;
};

export default CarPitstopsNivo;
