import { DualAxes } from "@ant-design/charts";
import * as React from "react";

import { Empty } from "antd";
import { useAppSelector } from "../../stores";
import { secAsHHMM } from "../../utils/output";
import { antChartsTheme } from "../antcharts/color";
import { statsDataFor } from "../live/statsutil";

export const WeatherEvolution: React.FC = () => {
  const snapshots = useAppSelector((state) => state.eventSnapshots);

  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const WeatherChart = () => {
    const plotdata: { x: string; y: number; temp: string }[] = [];
    const precipitationData: { x: string; Precipitation: number }[] = [];
    const graphTheme = antChartsTheme(globalSettings.theme);

    if (snapshots.length === 0) {
      return <Empty description="Not enough data" />;
    }
    let lastWetness = snapshots[0].trackWetness;
    let lastTime = snapshots[0].timeOfDay.toString();
    const annos = [] as any[];
    snapshots.forEach((e) => {
      const xKey = e.timeOfDay.toString();
      precipitationData.push({
        x: xKey,
        Precipitation: parseFloat((e.precipitation * 100.0).toPrecision(2)),
      });
      if (e.trackWetness !== lastWetness) {
        // console.log("Wetness change", lastWetness, e.trackWetness, lastTime, xKey);
        annos.push({
          type: "region",
          start: [lastTime, "min"] as [string, string],
          end: [xKey, "max"] as [string, string],
          style: { fill: antChartsTheme(globalSettings.theme).antd.trackWetness[lastWetness] },
          top: true,
        });

        lastWetness = e.trackWetness;
        lastTime = xKey;
      }
      plotdata.push({
        x: xKey,
        y: e.trackTemp,
        temp: "Track",
      });
      plotdata.push({
        x: xKey,
        y: e.airTemp,
        temp: "Air",
      });
    });
    // we need to add the info for the last region
    annos.push({
      type: "region",
      start: [lastTime, "min"] as [string, string],
      end: ["max", "max"] as [string, string],
      style: { fill: antChartsTheme(globalSettings.theme).antd.trackWetness[lastWetness] },
      top: true,
    });
    // console.log(annos);
    const work = statsDataFor(plotdata.map((v) => v.y));

    // console.log(plotdata);
    const config = {
      // width: 800,
      height: 400,
      theme: graphTheme.antd.theme,
      data: [plotdata, precipitationData],
      xField: "x",
      yField: ["y", "Precipitation"],
      annotations: {
        y: annos,
      },
      geometryOptions: [
        {
          geometry: "line",
          seriesField: "temp",
          color: ["orange", "red"],
        },
        {
          geometry: "line",
          lineStyle: { lineDash: [4, 4] },
          color: "blue",
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
          formatter: (d: number) => d.toFixed(1) + "°C",
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
      <WeatherChart />
    </>
  );
};
