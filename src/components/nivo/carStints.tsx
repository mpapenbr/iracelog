import { ResponsiveBar } from "@nivo/bar";
import { Empty } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { ICarStintInfo, IStintInfo } from "../../stores/wamp/types";
import { secAsHHMMSS, secAsMMSS, sortCarNumberStr } from "../../utils/output";

const CarStintsNivo: React.FC<{}> = () => {
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.stints);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr).reverse();
  const numEntries = (item: ICarStintInfo) => item.history.length + (item.current.isCurrentStint ? 1 : 0);
  const maxStints = carStints.reduce((a, b) => (numEntries(b) > a ? numEntries(b) : a), 0);

  const dataLookup = carStints.reduce((prev, cur) => {
    const stints = [...cur.history].concat(cur.current.isCurrentStint ? cur.current : []);
    prev.set(cur.carNum, stints);
    return prev;
  }, new Map<string, IStintInfo[]>());

  // console.log(x);
  const stintData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    const getValue = (v: IStintInfo) => {
      switch (uiSettings.showAsLabel) {
        case "duration":
          return v.stintTime;
        case "laps":
          return v.numLaps;
      }
    };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["Stint " + (idx + 1)]: getValue(v) }));
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
    var matchRE = /Stint (\d+)/g;
    var match = matchRE.exec(data.id);
    const stintInfo = dataLookup.get(data.indexValue)!;

    const stintIdx = parseInt(match![1]) - 1;
    const item = stintInfo[stintIdx];
    return (
      <div style={{ background: "white" }}>
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
  const labelFormatter = (v: number) => {
    switch (uiSettings.showAsLabel) {
      case "duration":
        return secAsMMSS(v);
      case "laps":
        return v;
    }
  };
  const InternalGraph = (
    <div style={{ height: "750px" }}>
      <ResponsiveBar
        data={stintData}
        keys={_.range(1, maxStints + 1).map((i) => "Stint " + i)}
        indexBy="car"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        layout="horizontal"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        enableGridY={false}
        enableGridX={true}
        label={(d) => `${labelFormatter(d.value as number)}`}
        animate={false}
        tooltip={(d) => CustomTooltip(d)}
        labelSkipWidth={20}
        axisLeft={{
          format: (value) => `#${value}`,
        }}
      />
    </div>
  );

  return <>{uiSettings.showCars.length === 0 ? <Empty description="Select cars" /> : InternalGraph}</>;
};

export default CarStintsNivo;
