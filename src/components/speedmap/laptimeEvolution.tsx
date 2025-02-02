import { DualAxes } from "@ant-design/charts";
import * as React from "react";

import { timestampDate } from "@bufbuild/protobuf/wkt";
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
      var xKey = "";
      switch (globalSettings.timeMode) {
        case "session":
          xKey = secAsHHMM(e.sessionTime);
          break;
        case "sim":
          xKey = secAsHHMM(e.timeOfDay);
          break;
        case "real":
          const d: Date = timestampDate(e.recordStamp!);
          // JS hell when calculating days. In order to use own formatter we need the seconds.
          // Note: TZ-offset -60 on GMT+0100 ;)
          xKey = secAsHHMM((d.getTime() / 1000 - d.getTimezoneOffset() * 60) % 86400);
          break;
      }
      trackTempData.push({
        x: xKey,
        "Track temp": parseFloat(e.trackTemp.toPrecision(3)),
      });
      Object.entries(e.carClassLaptimes)
        .sort((a, b) => a[1] - b[1]) // sort by laptimes desc
        .forEach((classData) => {
          if (classData[1] > 0) {
            plotdata.push({
              // x: e.sessionTime.toString(),
              x: xKey,
              y: classData[1],

              carClass: carClassLookup.get(classData[0]) ?? "Class " + classData[0],
            });
          } else {
            console.log("No laptimes for", classData[0], e);
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
