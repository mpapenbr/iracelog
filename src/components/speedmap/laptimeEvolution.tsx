import { DualAxes } from "@ant-design/charts";
import * as React from "react";

import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMM } from "../../utils/output";
import { statsDataFor } from "../live/statsutil";

export const LaptimeEvolution: React.FC = () => {
  const payload = useAppSelector((state) => state.speedmapEvolution);
  const carClasses = useAppSelector((state) => state.carClasses);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map());

  const LaptimeEvolutionChart = () => {
    const plotdata: { x: string; y: number; carClass: string }[] = [];
    const trackTempData: { x: string; "Track temp": number }[] = [];

    payload.forEach((e) => {
      const xKey = e.timeOfDay.toString();
      trackTempData.push({
        x: xKey,
        "Track temp": parseFloat(e.trackTemp.toPrecision(3)),
      });
      Object.entries(e.laptimes).forEach((classData) => {
        plotdata.push({
          // x: e.sessionTime.toString(),
          x: xKey,
          y: classData[1],

          carClass: carClassLookup.get(classData[0]) ?? "Class " + classData[0],
        });
      });
    });

    const work = statsDataFor(plotdata.map((v) => v.y));

    // console.log(plotdata);
    const config = {
      // width: 800,
      height: 400,
      data: [plotdata, trackTempData],
      xField: "x",
      yField: ["y", "Track temp"],
      geometryOptions: [
        {
          geometry: "line",
          seriesField: "carClass",
        },
        {
          geometry: "line",
          lineStyle: { lineDash: [4, 4] },
          color: "orange",
        },
      ],
      yAxis: {
        y: {
          nice: true,
          minLimit: Math.floor(work.minTime),
          maxLimit: Math.ceil(work.q99),
        },
      },
      meta: {
        y: {
          formatter: (d: number) => lapTimeString(d),
          // minLimit: Math.floor(work.minTime),
          // maxLimit: Math.ceil(work.q95),

          tickCount: 9,
        },
        x: {
          formatter: (d: number) => secAsHHMM(d),
        },
      },
      animation: false,
    };
    return <DualAxes {...config} />;
  };
  return (
    <>
      <LaptimeEvolutionChart />
    </>
  );
};
