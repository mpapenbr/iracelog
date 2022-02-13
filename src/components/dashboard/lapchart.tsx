import { Line } from "@ant-design/charts";
import { ICarLaps, IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import React from "react";
import { useSelector } from "react-redux";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";
import { lapTimeString, sortCarNumberStr } from "../../utils/output";
import { assignCarColors } from "../live/colorAssignment";
import { statsDataFor, stintLaps } from "../live/statsutil";
import { getCarStints } from "../live/util";

const Lapchart: React.FC = () => {
  const availableCars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.dashboard);

  const showCars = userSettings.showCars;
  const currentCarLaps = (carNum: string) => carLaps.find((v) => v.carNum === carNum);
  const mergeComputeCarLaps = (stints: IStintInfo[]): ICarLaps[] => {
    const myStintLaps = (v: IStintInfo) => stintLaps(v, currentCarLaps(v.carNum)!);
    const x = stints.flatMap((v) => ({ carNum: v.carNum, laps: myStintLaps(v) }));
    return x;
  };

  const assignedCarColors = assignCarColors(availableCars);
  const localColors = userSettings.showCars
    .sort(sortCarNumberStr)
    // .map((carNum) => cat10Colors[showCars.indexOf(carNum) % cat10Colors.length]);
    .map((carNum) => assignedCarColors.get(carNum) ?? "black");

  const allCarLaps: ICarLaps[] = carStints
    .filter((v) => showCars.includes(v.carNum))
    .map((v) => currentCarLaps(v.carNum)!)
    .filter((v) => v !== undefined);

  const computeCarLaps: ICarLaps[] = carStints
    .filter((v) => showCars.includes(v.carNum))
    .map((v) => mergeComputeCarLaps(getCarStints(carStints, v.carNum)))
    .flatMap((li) => [...li]);

  const work = statsDataFor(computeCarLaps.flatMap((v) => v.laps.map((l) => l.lapTime)));
  // console.log(work);

  // some strange ant-design/charts bug: https://github.com/ant-design/ant-design-charts/issues/797
  // workaround is to use strings for xaxis...
  const lapData = allCarLaps
    .sort((a, b) => showCars.indexOf(a.carNum) - showCars.indexOf(b.carNum))
    .map((v) => v.laps.map((l) => ({ carNum: `#${v.carNum}`, ...l, lapNoStr: "" + l.lapNo })))
    .flatMap((a) => [...a]);
  // console.log(lapData);
  const sliderData = globalWamp.currentLiveId ? undefined : { start: 0, end: 1 };
  const animate = globalWamp.currentLiveId ? false : true;
  const config = {
    data: lapData,

    xField: "lapNoStr",
    yField: "lapTime",
    seriesField: "carNum",
    point: {
      size: 3,
      shape: "diamond",
    },
    line: { size: 0 },

    color: localColors,
    slider: sliderData,
    yAxis: {
      nice: true,
      minLimit: Math.floor(work.minTime),
      maxLimit: Math.ceil(work.q95),
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
    animation: animate,
  };
  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return <Line {...config} />;
  // return <Scatter {...config} />;
};

export default Lapchart;
