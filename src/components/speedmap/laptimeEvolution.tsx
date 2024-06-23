import { DualAxes } from "@ant-design/charts";
import * as React from "react";

import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMM } from "../../utils/output";
import { antChartsTheme } from "../antcharts/color";
import { statsDataFor } from "../live/statsutil";

export const LaptimeEvolution: React.FC = () => {
  const snapshots = useAppSelector((state) => state.eventSnapshots);
  const carClasses = useAppSelector((state) => state.carClasses);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map());

  const LaptimeEvolutionChart = () => {
    const plotdata: { x: string; y: number; carClass: string }[] = [];
    const trackTempData: { x: string; "Track temp": number }[] = [];
    const graphTheme = antChartsTheme(globalSettings.theme);

    snapshots.forEach((e) => {
      // don't want to plot data without laptimes, DualAxes adds those entries at the end
      const hasLaptime = Object.entries(e.carClassLaptimes).filter((v) => v[1] > 0).length > 0;
      if (!hasLaptime) {
        return;
      }
      const xKey = e.timeOfDay.toString();
      trackTempData.push({
        x: xKey,
        "Track temp": parseFloat(e.trackTemp.toPrecision(3)),
      });
      Object.entries(e.carClassLaptimes).forEach((classData) => {
        if (classData[1] > 0) {
          plotdata.push({
            // x: e.sessionTime.toString(),
            x: xKey,
            y: classData[1],

            carClass: carClassLookup.get(classData[0]) ?? "Class " + classData[0],
          });
        }
      });
    });

    const work = statsDataFor(plotdata.map((v) => v.y));

    // console.log(plotdata);
    const config = {
      // width: 800,
      height: 400,
      theme: graphTheme.antd.theme,
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
        "Track temp": {
          formatter: (d: number) => d.toFixed(1) + "°C",
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
