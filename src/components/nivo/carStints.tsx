import { ResponsiveBar, ResponsiveBarCanvas } from "@nivo/bar";
import { Empty, theme } from "antd";
import _ from "lodash";
import React from "react";

import { CarOccupancy } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_occupancy_pb";
import {
  CarStint,
  StintInfo,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_stint_pb";
import { secAsMMSS } from "../../utils/output";

const { useToken } = theme;
interface MyProps {
  carStints: CarStint[];
  carOccs: CarOccupancy[];
  showCars: string[];
  showAsLabel: string;
  rangeTimeFormatter: (sec: number) => string;
}
const CarStintsNivo: React.FC<MyProps> = (props: MyProps) => {
  const { token } = useToken();
  const carOrder = [...props.showCars].reverse();
  const numEntries = (item: CarStint) =>
    item.history.length + (item.current?.isCurrentStint ? 1 : 0);
  const maxStints = props.carStints.reduce((a, b) => (numEntries(b) > a ? numEntries(b) : a), 0);

  const dataLookup = props.carStints.reduce((prev, cur) => {
    const stints = [...cur.history].concat(cur.current?.isCurrentStint ? cur.current : []);
    // history data does not contain carNum. we'll add it here
    const newStints = stints.map((v) => ({ ...v, carNum: cur.carNum }));
    prev.set(cur.carNum, newStints);
    return prev;
  }, new Map<string, StintInfo[]>());

  const guessNumToDraw = props.carStints
    .filter((v) => props.showCars.includes(v.carNum))
    .reduce((prev, cur) => {
      return prev + cur.history.length + 1;
    }, 0);

  const stintData = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: carNum };
    const getValue = (v: StintInfo) => {
      switch (props.showAsLabel) {
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

  const stintDriverLookup: Map<string, string[]> = carOrder.reduce((prev, cur) => {
    const si: StintInfo[] = dataLookup.get(cur)!;
    if (si === undefined) {
      // may happen if some driver did not move the car at all (for example)
      return prev;
    }
    const curCarInfo = props.carOccs.find((v) => v.carNum === cur);
    const newCarData = si.reduce((res, siCur) => {
      const driver = curCarInfo?.drivers.find((d) =>
        d.seatTimes.find(
          (s) => s.enterCarTime <= siCur.exitTime && s.leaveCarTime + 5 >= siCur.enterTime,
        ),
      );

      // return ["res"];
      return [...res, driver ? driver.name : "n.a."];
    }, [] as string[]);
    prev.set(cur, newCarData);
    return prev;
  }, new Map());

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
    const matchRE = /Stint (\d+)/g;
    const match = matchRE.exec(data.id);
    const stintInfo = dataLookup.get(data.indexValue)!;

    const stintIdx = parseInt(match![1]) - 1;
    const item = stintInfo[stintIdx];
    const driver = stintDriverLookup.get(item.carNum)?.[stintIdx];
    return (
      <div style={{ background: token.colorBgContainer, color: token.colorTextBase }}>
        <strong>
          #{item.carNum} {data.id}
        </strong>
        <br /> {driver}
        <br />
        Lap {item.lapExit} - {item.lapEnter} ({item.lapEnter - item.lapExit + 1})
        <br />
        {props.rangeTimeFormatter(item.exitTime)} - {props.rangeTimeFormatter(item.enterTime)}
      </div>
    );
  };
  const labelFormatter = (v: number) => {
    switch (props.showAsLabel) {
      case "duration":
        return secAsMMSS(v);
      case "laps":
        return v;
    }
  };
  const graphProps = {
    data: stintData,
    keys: _.range(1, maxStints + 1).map((i) => "Stint " + i),
    indexBy: "car",
    label: (d: any) => `${labelFormatter(d.value as number)}`,
    tooltip: (d: any) => CustomTooltip(d),
    enableGridY: false,
    enableGridX: false,
    margin: { top: 20, right: 130, bottom: 50, left: 60 },
    labelSkipWidth: 20,
    axisLeft: { format: (value: any) => `#${value}` },
    theme: {
      axis: {
        ticks: {
          text: {
            fill: token.colorTextLabel,
          },
          line: { stroke: token.colorTextLabel },
        },
      },
    },
    // the following props don't get recognized. error message is like: "string" not valid here
    // layout: "horizontal",
    // valueScale: {type: "linear"  },
    // indexScale: {type: "band", round:true},
  };

  // console.log(guessNumToDraw);
  const calcHeight = Math.min(1200, Math.max(150, carOrder.length * 30));
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

export default CarStintsNivo;
