import { Line, LineConfig } from "@ant-design/charts";

import {
  CarLaps,
  Lap,
} from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_laps_pb";
import { StintInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";
import _ from "lodash";
import React from "react";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { lapTimeString, sortCarNumberStr } from "../../utils/output";
import { assignCarColors } from "../live/colorAssignment";
import { statsDataFor, stintLaps } from "../live/statsutil";
import { getCarStints } from "../live/util";
import { antChartsTheme } from "./color";

interface MyProps {
  showCars: string[];
  limitLastLaps: number;
  filterSecs: number;
}
const Lapchart: React.FC<MyProps> = (props) => {
  const availableCars = useAppSelector((state) => state.availableCars);

  const carStints = useAppSelector((state) => state.carStints);

  const carLaps = useAppSelector((state) => state.carLaps);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  // const availableCars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  // const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  // const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  // const userSettings = useSelector((state: ApplicationState) => state.userSettings.driverLaps);

  const { showCars } = props;
  const currentCarLaps = (carNum: string) => carLaps.find((v) => v.carNum === carNum);
  const mergeComputeCarLaps = (stints: StintInfo[], carNum: string): CarLaps[] => {
    const myStintLaps = (v: StintInfo) => stintLaps(v, currentCarLaps(carNum)!);
    const x = stints.flatMap((v) => ({ carNum: carNum, laps: myStintLaps(v) }));
    return globalWamp.currentLiveId && props.limitLastLaps > 0 ? x.slice(-props.limitLastLaps) : x;
  };

  const assignedCarColors = assignCarColors(availableCars);
  const localColors = showCars
    .sort(sortCarNumberStr)

    .map((carNum) => assignedCarColors.get(carNum) ?? "black");

  const allCarLaps: CarLaps[] = carStints
    .filter((v) => showCars.includes(v.carNum))
    .map((v) => currentCarLaps(v.carNum)!)
    .filter((v) => v !== undefined);

  const computeCarLaps: CarLaps[] = carStints
    .filter((v) => showCars.includes(v.carNum))
    .map((v) => mergeComputeCarLaps(getCarStints(carStints, v.carNum), v.carNum))
    .flatMap((li) => [...li]);

  const work = statsDataFor(computeCarLaps.flatMap((v) => v.laps.map((l) => l.lapTime)));
  const workLapNo = _.max(computeCarLaps.flatMap((v) => v.laps.map((l) => l.lapNo)));
  // console.log(work);
  const toShowLaps = (laps: Lap[]): Lap[] =>
    globalWamp.currentLiveId && props.limitLastLaps > 0
      ? laps.slice(-props.limitLastLaps).filter((v) => v.lapNo >= workLapNo! - props.limitLastLaps)
      : laps;
  // some strange ant-design/charts bug: https://github.com/ant-design/ant-design-charts/issues/797
  // workaround is to use strings for xaxis...
  const lapData = allCarLaps
    .sort((a, b) => showCars.indexOf(a.carNum) - showCars.indexOf(b.carNum))
    // .sort((a, b) => showCars.indexOf(a.carNum) - showCars.indexOf(b.carNum))
    .map((v) =>
      toShowLaps(v.laps).map((l) => ({ carNum: `#${v.carNum}`, ...l, lapNoStr: "" + l.lapNo })),
    )
    .flatMap((a) => [...a]);
  // console.log(lapData);
  const sliderData = globalWamp.currentLiveId ? undefined : { start: 0, end: 1 };
  const animate = globalWamp.currentLiveId ? false : true;
  const graphTheme = antChartsTheme(globalSettings.theme);
  const config: LineConfig = {
    data: lapData,

    xField: "lapNoStr",
    yField: "lapTime",
    seriesField: "carNum",
    point: {
      size: 3,
      shape: "diamond",
    },
    theme: graphTheme.antd.theme,
    lineStyle: {
      lineWidth: 1,
    },

    color: localColors,
    slider: sliderData,
    yAxis: {
      nice: true,
      minLimit: Math.floor(work.minTime),
      maxLimit:
        props.filterSecs > 0 ? Math.ceil(work.median + props.filterSecs) : Math.ceil(work.q95),
      // label: {formatter: (d: number) => lapTimeString(d)},
    },
    interactions: globalWamp.currentLiveId ? [] : [{ type: "brush" }],
    meta: {
      lapTime: {
        formatter: (d: number) => lapTimeString(d),
        // minLimit: Math.floor(work.minTime),
        // maxLimit: Math.ceil(work.q95),

        tickCount: 9,
      },
    },
    animate: animate,
    animation: animate,
  };
  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return <Line {...config} />;
  // return <Scatter {...config} />;
};

export default Lapchart;
