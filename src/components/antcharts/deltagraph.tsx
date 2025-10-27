import { Line, LineConfig } from "@ant-design/plots";
// import { Types } from "@antv/g2/lib";
import { Empty } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { assignCarColors } from "../live/colorAssignment";
import { antChartsTheme } from "./color";

interface MyProps {
  showCars: string[];
  referenceCarNum?: string;
  limitLastLaps: number;
  deltaRange: number;
  height?: number;
}
const Delta: React.FC<MyProps> = (props: MyProps) => {
  const availableCars = useAppSelector((state) => state.availableCars);

  const raceGraph = useAppSelector((state) => state.raceGraph);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const { showCars, referenceCarNum } = props;
  if (!referenceCarNum) return <Empty description="Select reference car" />;
  if (showCars.length < 2) return <Empty description="not enough data" />;

  interface IGraphData {
    carNum: string;
    lapNo: string; // due to line chart issue https://github.com/ant-design/ant-design-charts/issues/797
    gap: number;
  }

  const dataForCar = (carNum: string) => {
    return raceGraph
      .reduce((prev, current) => {
        if (current.carClass.localeCompare("overall") !== 0) return prev;
        const refCarEntry = current.gaps.find((gi) => gi.carNum === referenceCarNum);
        const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
        if (carEntry !== undefined && refCarEntry !== undefined) {
          if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
            prev.push({
              lapNo: "" + current.lapNo,
              carNum: "#" + carNum,
              gap: refCarEntry.gap - carEntry.gap,
            });
          }
        }
        return prev;
      }, [] as IGraphData[])
      .slice(globalWamp.currentLiveId && props.limitLastLaps > 0 ? -props.limitLastLaps : 0);
  };
  const assignedCarColors = assignCarColors(availableCars);
  const localColors = showCars

    .filter((v) => v !== referenceCarNum)
    // .map((carNum) => cat10Colors[showCars.indexOf(carNum) % cat10Colors.length]);
    .map((carNum) => assignedCarColors.get(carNum) ?? "black");

  // console.log(localColors);
  const graphDataOrig = showCars
    .filter((v) => v !== referenceCarNum)

    .map((carNum) => dataForCar(carNum))
    .flatMap((a) => [...a]);
  // console.log(graphDataOrig);
  // some strange ant-design/charts bug: https://github.com/ant-design/ant-design-charts/issues/797
  // workaround is to use strings for xaxis...

  const sliderData = () => {
    if (globalWamp.currentLiveId) {
      return undefined;
    }
    if (showCars.length > 0) return { x: { start: 0, end: 1 } };
    return undefined;
  };

  const formatDelta = (d: number) => {
    return sprintf("%.1fs", d);
  };

  const range = {
    min: Math.floor(Math.max(_.minBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, -props.deltaRange)),
    max: Math.ceil(Math.max(_.minBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, props.deltaRange)),
  };
  const useHeight = props.height !== undefined ? props.height : 500;
  const graphTheme = antChartsTheme(globalSettings.theme);
  const config: LineConfig = {
    data: graphDataOrig,

    limitInPlot: true,
    xField: "lapNo",
    yField: "gap",
    seriesField: "carNum",
    colorField: "carNum",

    theme: graphTheme.antd.theme,
    slider: sliderData(),

    axis: {
      y: {
        nice: true,
        labelFormatter: formatDelta,
        gridLineWidth: 1,
        gridLineDash: [0, 0],
      },
      x: {
        style: {
          labelTransform: "rotate(0)",
        },
      },
    },
    scale: {
      y: {
        nice: false,
        domainMin: range.min,
        domainMax: range.max,
      },

      color: {
        range: localColors,
      },
    },
    style: {
      lineWidth: 2,
    },
    tooltip: {
      title: (d) => `Lap ${d.lapNo}`,
      items: [
        {
          channel: "y",
          field: "gap",
          name: "gap",
          valueFormatter: formatDelta,
        },
      ],
    },

    interaction: globalWamp.currentLiveId ? {} : { brushFilter: true },

    animate: false,
    autoFit: true,
    height: useHeight,
    annotations: [
      {
        type: "rangeY",
        yField: "y",

        colorField: "region",
        data: [
          { y: [range.min, 0], region: "1" },
          { y: [0, range.max], region: "2" },
        ],
        scale: {
          color: {
            range: [graphTheme.antd.regionGreen, graphTheme.antd.regionRed],
            independent: true,
            guide: null,
          },
        },
        style: { fillOpacity: 0.15 },
        animate: false,
      },
    ],

    annotationsOldV1: [
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "min"] as [string, string],

        style: {
          fill: graphTheme.antd.regionGreen,
        },
        top: true,
      },
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "max"] as [string, string],

        style: {
          fill: graphTheme.antd.regionRed,
        },
        top: true,
      },
    ],
  };

  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return (
    <div>
      {/* <Line {...config} height={props.height} /> */}
      <Line {...config} />
    </div>
  );

  // return <Scatter {...config} />;
};

export default Delta;
