import { Box } from "@ant-design/plots";
import { Empty } from "antd";
import React from "react";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { lapTimeString } from "../../utils/output";
import { antChartsTheme } from "../antcharts/color";
import { IBoxPlotDataExtended, boxPlotDataFor, stintLaps } from "../live/statsutil";
import { getCarStints } from "../live/util";

interface MyProps {
  showCars: string[];
}
const BoxPlot: React.FC<MyProps> = (props) => {
  const carStints = useAppSelector((state) => state.carStints);

  const carLaps = useAppSelector((state) => state.carLaps);
  const globalSettings = useAppSelector((state) => state.userSettings.global);
  const { showCars } = props;
  const currentCarLaps = (carNum: string) => carLaps.find((v) => v.carNum === carNum);

  const boxData = [...carStints]
    .sort((a, b) => showCars.indexOf(a.carNum) - showCars.indexOf(b.carNum))
    .filter((v) => showCars.includes(v.carNum))

    .reduce((collect, v) => {
      const ret = [];
      let curIdx = 0; //
      const stints = getCarStints(carStints, v.carNum).slice(-2);
      if (stints.length === 2) {
        const prevStint = stintLaps(stints[0], currentCarLaps(v.carNum)!).flatMap((v) => v.lapTime);
        if (prevStint.length > 3) {
          ret.push({ ...boxPlotDataFor(prevStint), type: "prev" });
        }
        curIdx = 1; // the current stint is on idx pos 1
      }
      const curStint = stintLaps(stints[curIdx], currentCarLaps(v.carNum)!).flatMap(
        (v) => v.lapTime,
      );
      if (curStint.length > 3) {
        ret.push({ ...boxPlotDataFor(curStint), type: "current" });
      }

      return collect.concat(
        ret.flatMap((item) => ({
          ...item,
          carNum: "#" + v.carNum,
          minTime: item.realLowerFence,
          maxTime: item.realUpperFence,
          avg: item.median + 0.5,
        })),
      );
    }, [] as IBoxPlotDataExtended[]);

  // console.log(boxData);

  const bounds = boxData.reduce(
    (prev, cur) => ({
      minLimit: Math.floor(Math.min(prev.minLimit, cur.minTime)),
      maxLimit: Math.ceil(Math.max(prev.maxLimit, cur.maxTime)),
    }),
    { minLimit: Number.MAX_SAFE_INTEGER, maxLimit: 0 },
  );
  // console.log(bounds);
  const animation = globalWamp.currentLiveId ? false : true;
  const graphTheme = antChartsTheme(globalSettings.theme);
  const laptimeFormatter = (d: number) => lapTimeString(d);
  const config = {
    data: boxData,

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
    seriesField: "type",
    colorField: "type",
    xField: "carNum",
    theme: graphTheme.antd.theme,
    // outliersField: "outliers", // deactivated. see https://github.com/ant-design/ant-design-charts/issues/800
    meta: {
      minTime: { ...laptimeFormatter },
      maxTime: { ...laptimeFormatter },
      median: { ...laptimeFormatter },
      q25: { ...laptimeFormatter },
      q75: { ...laptimeFormatter },
      outliers: { ...laptimeFormatter },
    },
    // animate: globalWamp.currentLiveId ? false : true,
    animate: false,
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
  // return <Scatter {...config} />;
};

export default BoxPlot;
