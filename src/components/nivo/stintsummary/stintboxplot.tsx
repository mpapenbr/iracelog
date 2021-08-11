import { Box } from "@ant-design/charts";
import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { globalWamp } from "../../../commons/globals";
import { ApplicationState } from "../../../stores";
import { lapTimeString } from "../../../utils/output";
import { boxPlotDataFor, stintLaps } from "../../live/statsutil";
import { getCarStints } from "../../live/util";

interface MyProps {
  carNum?: string;
}

const StintBoxplot: React.FC<MyProps> = (props: MyProps) => {
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }

  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;

  const quantile = (sorted: number[], q: number) => {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };
  const stintData = (si: IStintInfo) => {
    // exclude in and outlap from calculation
    const laps = currentCarLaps.laps.filter((v) => v.lapNo >= si.lapExit && v.lapNo <= si.lapEnter).slice(1, -1);
    const sorted = laps.map((d) => d.lapTime).sort((a, b) => a - b);
    return {
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      q1: quantile(sorted, 0.25),
      q2: quantile(sorted, 0.5),
      q3: quantile(sorted, 0.75),
    };
  };

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
    { minLimit: Number.MAX_SAFE_INTEGER, maxLimit: 0 }
  );
  // console.log(bounds);
  // console.log(boxData);
  const laptimeFormatter = { formatter: (d: any) => lapTimeString(d) };
  const config = {
    data: boxData,
    title: "huhu",
    yAxis: {
      label: { formatter: (d: any) => lapTimeString(d) },

      ...bounds,
    },
    xField: "stint",
    // outliersField: "outliers", // deactivated. see https://github.com/ant-design/ant-design-charts/issues/800
    meta: {
      minTime: { ...laptimeFormatter },
      maxTime: { ...laptimeFormatter },
      median: { ...laptimeFormatter },
      q25: { ...laptimeFormatter },
      q75: { ...laptimeFormatter },
      outliers: { ...laptimeFormatter },
    },
  };
  if (boxData.length === 0) {
    return <Empty description="not enough data for box plot" />;
  }
  if (globalWamp.currentLiveId) {
    return <Box {...config} yField={["minTime", "q25", "median", "q75", "maxTime"]} animation={false} />;
  } else {
    return <Box {...config} yField={["minTime", "q25", "median", "q75", "maxTime"]} />;
  }
};
export default StintBoxplot;
