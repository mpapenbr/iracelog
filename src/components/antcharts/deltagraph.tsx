import { Line } from "@ant-design/charts";
import { Types } from "@antv/g2/lib";
import { Empty } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { firstBy } from "thenby";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { assignCarColors } from "../live/colorAssignment";

interface MyProps {
  showCars: string[];
  referenceCarNum?: string;
  limitLastLaps: number;
  deltaRange: number;
  height?: number;
}
const Delta: React.FC<MyProps> = (props: MyProps) => {
  const availableCars = useAppSelector((state) => state.availableCars);

  const userSettingsx = useAppSelector((state) => state.userSettings.raceGraphRelative);
  const raceGraph = useAppSelector((state) => state.raceGraph);

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
              carNum: carNum,
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

  const sliderData = globalWamp.currentLiveId ? undefined : { start: 0, end: 1 };

  const noAnimationOption = {
    duration: 0,
  };
  const config = {
    data: graphDataOrig,

    limitInPlot: true,
    xField: "lapNo",
    yField: "gap",
    seriesField: "carNum",
    // point: {
    //   size: 3,
    //   shape: "diamond",
    // },
    line: { size: 2 },

    color: localColors,
    slider: sliderData,
    yAxis: {
      nice: true,

      minLimit: Math.floor(
        Math.max(_.minBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, -props.deltaRange),
      ),
      maxLimit: Math.ceil(
        Math.min(_.maxBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, props.deltaRange),
      ),
      // label: {formatter: (d: number) => lapTimeString(d)},
    },
    tooltip: {
      customItems: (orig: Types.TooltipItem[]) => {
        return orig.sort(
          firstBy<Types.TooltipItem>(
            (a, b) => Math.sign(b.data.gap) - Math.sign(a.data.gap),
          ).thenBy((a, b) => b.data.gap - a.data.gap),
        );

        // return orig.sort((a, b) => a.data.gap - b.data.gap);
      },
    },
    interactions: globalWamp.currentLiveId ? [] : [{ type: "brush" }],
    meta: {
      gap: {
        formatter: (d: number) => sprintf("%.1fs", d),
        // minLimit: Math.floor(work.minTime),
        // maxLimit: Math.ceil(work.q95),

        tickCount: 9,
      },
      carNum: {
        formatter: (d: string) => "#" + d,
      },
    },

    animate: false,
    animation: {
      appear: noAnimationOption,
      update: noAnimationOption,
      // enter: noAnimationOption,
      // leave: noAnimationOption,
    },
    annotations: [
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "min"] as [string, string],

        style: {
          fill: "green",
        },
        top: true,
      },
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "max"] as [string, string],

        style: {
          fill: "red",
        },
        top: true,
      },
    ],
  };

  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return (
    <div>
      <Line {...config} height={props.height} />
    </div>
  );

  // return <Scatter {...config} />;
};

export default Delta;
