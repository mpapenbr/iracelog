import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Bullet } from "@nivo/bullet";
import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../../stores";
import { getCarStints } from "../../live/util";
import { commonProps } from "./commons";

interface MyProps {
  carNum?: string;
}

/**
 * Note: Idea was to use Bullets as Boxplot graph.
 * Doesn't work out for some reasons:
 * - for each stint we get an own bullet graph
 * - Bullets fit better as gauges (maybe we use them for live data, e.g. speed, laptimes)
 * @param props
 * @returns
 */
const StintBullets: React.FC<MyProps> = (props: MyProps) => {
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

  const bulletData = getCarStints(carStints, props.carNum).map((s, idx) => {
    const sd = stintData(s);
    console.log(sd);
    return {
      id: "Stint " + (idx + 1),
      ranges: [sd.minTime, sd.q1, sd.q2, sd.q3, sd.maxTime], // [sd.q1, sd.q2, sd.q3],
      measures: [], // [(sd.q2 - sd.q1) / 2],
      markers: [sd.q1, sd.q2, sd.q3],
      extData: sd,
    };
  });

  return (
    <>
      <Bullet {...commonProps} width={600} height={500} data={bulletData} minValue="auto" maxValue="auto" />
    </>
  );
};

export default StintBullets;
