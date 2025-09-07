import { DualAxes } from "@ant-design/plots";
import * as React from "react";

import { TrackWetness } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/common/v1/common_pb";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { Empty } from "antd";
import { useAppSelector } from "../../stores";
import { secAsHHMM } from "../../utils/output";
import { antChartsTheme } from "../antcharts/color";
import { statsDataFor } from "../live/statsutil";

export const WeatherEvolutionOld: React.FC = () => {
  const snapshots = useAppSelector((state) => state.eventSnapshots);

  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const WeatherChart = () => {
    interface Plotdata {
      x: String;
      y: number;
    }
    const airTemps: Plotdata[] = [];
    const trackTemps: Plotdata[] = [];

    const plotdata: { x: string; y: number; temp: string }[] = [];
    const precipitationData: { x: string; Precipitation: number }[] = [];
    const trackConditions: { x: string; trackCondition: number }[] = [];
    const graphTheme = antChartsTheme(globalSettings.theme);

    if (snapshots.length === 0) {
      return <Empty description="Not enough data" />;
    }
    let lastWetness = snapshots[0].trackWetness;
    let lastTime = "0";
    const annos = [] as any[];
    const xLabelValue = (idx: string): string => {
      const sIdx = parseInt(idx);
      if (isNaN(sIdx) || sIdx < 0 || sIdx >= snapshots.length) {
        return idx;
      }
      const e = snapshots[sIdx];

      switch (globalSettings.timeMode) {
        case "session":
          return secAsHHMM(e.sessionTime);
        case "sim":
          return secAsHHMM(e.timeOfDay);
        case "real":
          const d: Date = timestampDate(e.recordStamp!);
          // JS hell when calculating days. In order to use own formatter we need the seconds.
          // Note: TZ-offset -60 on GMT+0100 ;)
          return secAsHHMM((d.getTime() / 1000 - d.getTimezoneOffset() * 60) % 86400);
      }
    };
    const trackConditionText = (v: TrackWetness): string => {
      switch (v) {
        case TrackWetness.UNSPECIFIED:
          return "";
        case TrackWetness.DRY:
          return "dry";
        case TrackWetness.MOSTLY_DRY:
          return "mostly dry";
        case TrackWetness.VERY_LIGHTLY_WET:
          return "very lightly wet";
        case TrackWetness.LIGHTLY_WET:
          return "lightly wet";
        case TrackWetness.MODERATELY_WET:
          return "moderately wet";
        case TrackWetness.VERY_WET:
          return "very wet";
        case TrackWetness.EXTREMELY_WET:
          return "extremely wet";
        default:
          return v + "";
      }
    };
    snapshots.forEach((e, idx) => {
      var xKey;
      xKey = "" + idx; // ant charts prefer strings as x axis values
      airTemps.push({
        x: xKey,
        y: e.airTemp,
      });
      trackTemps.push({
        x: xKey,
        y: e.trackTemp,
      });
      precipitationData.push({
        x: xKey,
        Precipitation: parseFloat((e.precipitation * 100.0).toPrecision(2)),
      });
      trackConditions.push({
        x: xKey,
        trackCondition: e.trackWetness,
      });
      if (e.trackWetness !== lastWetness) {
        // console.log("Wetness change", lastWetness, e.trackWetness, lastTime, xKey);
        annos.push({
          x: [lastTime, xKey],
          wetness: lastWetness,
          color: antChartsTheme(globalSettings.theme).antd.trackWetness[lastWetness],
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
    if (snapshots.length > 0 && lastWetness !== snapshots[snapshots.length - 1].trackWetness) {
      annos.push({
        x: [lastTime, "" + snapshots.length],
        wetness: lastWetness,
        color: antChartsTheme(globalSettings.theme).antd.trackWetness[lastWetness],
      });
    }

    const ccConfig = [];

    const work = statsDataFor(plotdata.map((v) => v.y));

    const tempValueFormatter = (d: number) => d.toFixed(1) + "°C";
    // don't worry about the minTime attr. We use reuse the common structure here ;)
    // the key is important if we want to use this scale for multiple data streams

    const tempScale = {
      y: { domainMin: Math.floor(work.minTime), domainMax: Math.ceil(work.q99), key: "temps" },
    };
    const configTrackTemp = {
      data: trackTemps,
      type: "line",
      yField: "y",
      colorField: () => "Track",
      style: {
        stroke: "orange",
      },

      scale: tempScale,
      axis: { y: { nice: true, title: "temp °C", style: { titleFill: "orange" } } },
      tooltip: {
        items: [
          {
            channel: "y",
            valueFormatter: tempValueFormatter,
            color: "orange",
          },
        ],
      },
    };
    const configAirTemp = {
      data: airTemps,
      type: "line",
      yField: "y",
      axis: { y: false },
      colorField: () => "Air",
      style: {
        stroke: "red",
      },
      scale: tempScale,
      tooltip: {
        items: [
          {
            channel: "y",
            valueFormatter: tempValueFormatter,
            color: "red",
          },
        ],
      },
    };

    const statsPrecipitation = statsDataFor(precipitationData.map((v) => v.Precipitation));

    const configPrecipitation = {
      data: precipitationData,
      type: "line",
      yField: "Precipitation",

      // needs range and/or scale
      axis: {
        y: {
          nice: true,
          position: "right",
          title: "Precipitation",
          style: { titleFill: "blue" },
        },
      },
      scale: {
        y: {
          domainMin: 0,
          domainMax: Math.ceil(statsPrecipitation.q99) > 0 ? Math.ceil(statsPrecipitation.q99) : 1,
        },
      },
      colorField: () => "Precipitation",
      style: {
        stroke: "blue",
      },
      tooltip: {
        items: [
          {
            channel: "y",
            color: "blue",
          },
        ],
      },
    };

    const configTrackCondition = {
      data: trackConditions,
      type: "line",
      yField: "trackCondition",
      colorField: () => "Track Condition",

      style: {
        stroke: "purple",
        lineWidth: 0,
      },

      axis: { y: false },
      tooltip: {
        items: [
          {
            channel: "y",
            valueFormatter: (d: number) => {
              return trackConditionText(d);
            },
            // valueFormatter: tempValueFormatter,
            color: "purple",
          },
        ],
      },
    };
    ccConfig.push(configTrackTemp, configAirTemp, configPrecipitation);
    ccConfig.push(configTrackCondition);
    const config = {
      // width: 800,
      // height: 400,
      theme: graphTheme.antd.theme,
      // data: [plotdata, precipitationData],
      xField: "x",

      // yField: ["y", "Precipitation"],
      // annotations: testAnnos,

      tooltip: {
        title: (item: any) => {
          return xLabelValue(item.x);
        },
      },
      axis: {
        x: {
          nice: true,
          style: {
            labelTransform: "rotate(0)",
          },
          labelFormatter: (v: string) => xLabelValue(v),
        },
      },
      children: ccConfig,
      annotations: [
        {
          type: "rangeX",
          xField: "x",

          colorField: "color",
          // data: [{ x: ["100", "120"], color: "red" }],
          data: annos,
          scale: {
            color: {
              type: "identity",
              independent: true,
              guide: null,
            },
          },
          style: { fillOpacity: 0.15 },
          animate: false,
        },
      ],
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
