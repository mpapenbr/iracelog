import { DualAxes, DualAxesConfig } from "@ant-design/charts";
import * as React from "react";

import { timestampDate } from "@bufbuild/protobuf/wkt";
import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMM } from "../../utils/output";
import { antChartsTheme } from "../antcharts/color";

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
    const alldata: { x: string; y: number; carClass: string; trackTemp: number }[] = [];
    const trackTempData: { x: string; trackTemp: number; "Track temp": number }[] = [];
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
        trackTemp: parseFloat(e.trackTemp.toPrecision(3)),
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

    const ccConfig = [];
    carClasses.forEach((cc, idx) => {
      const yAxis = (i: number) => {
        if (i == 0) {
          return {
            y: {
              nice: true,
              labelFormatter: (d: number) => lapTimeString(d),
            },
          };
        } else return { y: false };
      };
      ccConfig.push({
        data: plotdata,
        type: "line",
        yField: "y",
        seriesField: "carClass",
        colorField: "carClass",
        axis: yAxis(idx),
        style: {
          lineWidth: 2,
        },
        tooltip: {
          items: [
            {
              channel: "y",
              valueFormatter: lapTimeString,
            },
          ],
        },
      });
    });
    ccConfig.push({
      data: trackTempData,
      type: "line",
      yField: "trackTemp",

      axis: {
        y: {
          nice: true,
          position: "right",
          title: "temp °C",
          style: {
            titleFill: "orange",
          },
          gridLineWidth: 1,
          gridLineDash: [0, 0],
        },
      },
      style: {
        stroke: "orange",
        lineDash: [4, 4],
      },
      tooltip: {
        items: [
          {
            channel: "y",
            field: "trackTemp",
            name: "trackTemp",
            valueFormatter: (d: number) => d.toFixed(1) + "°C",
          },
        ],
      },
    });
    // current problems:
    // - track temps does not show up in legend
    // - track temp is shown with car class name in tooltip
    const config: DualAxesConfig = {
      // width: 800,
      height: 400,
      theme: graphTheme.antd.theme,
      // data: alldata,
      xField: "x",
      // legend: true,
      axis: {
        x: {
          nice: true,
          style: {
            labelTransform: "rotate(0)",
          },
        },
      },
      children: ccConfig,

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
