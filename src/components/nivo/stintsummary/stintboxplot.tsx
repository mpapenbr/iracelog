import { Box } from "@ant-design/plots";
import { Empty } from "antd";
import React from "react";

import { globalWamp } from "../../../commons/globals";

import { useAppSelector } from "../../../stores";
import { lapTimeString } from "../../../utils/output";
import { antChartsTheme } from "../../antcharts/color";
import { boxPlotDataFor, stintLaps } from "../../live/statsutil";
import { getCarStints } from "../../live/util";

interface MyProps {
  carNum?: string;
}

const StintBoxplot: React.FC<MyProps> = (props: MyProps) => {
  const carLaps = useAppSelector((state) => state.carLaps);
  const carStints = useAppSelector((state) => state.carStints);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }

  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;

  const boxData = getCarStints(carStints, props.carNum)
    .map((s, idx) => ({ ...s, stintNo: (idx + 1).toString() }))
    .filter((v) => v.numLaps > 3)
    .map((s) => {
      const laptimes = stintLaps(s, currentCarLaps).flatMap((v) => v.lapTime);

      const bpData = boxPlotDataFor(laptimes);
      // console.log(bpData);

      return {
        stint: s.stintNo,
        ...bpData,
        // some rearrangement
        minTime: bpData.realLowerFence,
        maxTime: bpData.realUpperFence,
      };
    });
  const bounds = boxData.reduce(
    (prev, cur) => ({
      minLimit: Math.floor(Math.min(prev.minLimit, cur.minTime)),
      maxLimit: Math.ceil(Math.max(prev.maxLimit, cur.maxTime)),
    }),
    { minLimit: Number.MAX_SAFE_INTEGER, maxLimit: 0 },
  );
  // console.log(bounds);
  // console.log(boxData);
  const laptimeFormatter = (d: number) => lapTimeString(d);
  const graphTheme = antChartsTheme(globalSettings.theme);
  const config = {
    data: boxData,
    title: "Stints",
    axis: {
      y: { labelFormatter: laptimeFormatter },
    },
    tooltip: {
      items: [
        { name: "minTime", channel: "y", valueFormatter: laptimeFormatter },
        { name: "q25", channel: "y1", valueFormatter: laptimeFormatter },
        { name: "median", channel: "y2", valueFormatter: laptimeFormatter },
        { name: "q75", channel: "y3", valueFormatter: laptimeFormatter },
        { name: "maxTime", channel: "y4", valueFormatter: laptimeFormatter },
      ],
    },
    theme: graphTheme.antd.theme,
    xField: "stint",
    autoFit: true,
    height: 500,
    // outliersField: "outliers", // deactivated. see https://github.com/ant-design/ant-design-charts/issues/800
  };
  if (boxData.length === 0) {
    return <Empty description="not enough data for box plot" />;
  }
  if (globalWamp.currentLiveId) {
    return (
      <Box {...config} yField={["minTime", "q25", "median", "q75", "maxTime"]} animation={false} />
    );
  } else {
    return <Box {...config} yField={["minTime", "q25", "median", "q75", "maxTime"]} />;
  }
};
export default StintBoxplot;
