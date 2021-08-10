import { IPitInfo, IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Empty, Tooltip } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../../stores";
import { secAsMMSS } from "../../../utils/output";
import { findDriverByStint, getCarPitStops, getCarStints } from "../../live/util";
import StintTooltip from "../stintTooltip";
import { colorsBySeatTime } from "./commons";

interface MyProps {
  carNum?: string;
  width?: number;
}

/**
 * provides a stretch with combined stints and pitstops
 * @param props
 * @returns
 */
const StintStretch: React.FC<MyProps> = (props: MyProps) => {
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;

  const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

  interface Combined {
    type: "stint" | "pit";
    data: IStintInfo | IPitInfo;
    ref: number;
    idx: number;
    minTime: number;
    maxTime: number;
    color?: string;
  }
  var work: Combined[] = getCarStints(carStints, props.carNum).map((d, idx) => {
    const driver = findDriverByStint(currentCarInfo, d);
    return {
      type: "stint",
      data: d,
      ref: d.exitTime,
      idx: idx + 1,
      minTime: d.exitTime,
      maxTime: d.enterTime,
      color: colorLookup.get(driver?.driverName!),
    };
  });
  const x: Combined[] = getCarPitStops(carPits, props.carNum).map((d, idx) => ({
    type: "pit",
    data: d,
    ref: d.enterTime,
    idx: idx + 1,
    minTime: d.enterTime,
    maxTime: d.exitTime,
  }));
  const combined = work.concat(x).sort((a, b) => a.ref - b.ref);

  const { minTime, maxTime } = combined.reduce(
    (a, b) => {
      return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
    },
    { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 }
  );
  const w = props.width ? props.width : 600;
  const h = 50;
  const step = w / (maxTime - minTime);
  // console.log(`min: ${minTime}, max: ${maxTime}, step: ${step}`);
  const InternalGraph = (
    <svg width={w} height={h}>
      <g transform="translate( 0 0) ">
        {combined
          .filter((c) => c.type === "pit")
          .map((c) => {
            return (
              <rect
                key={c.ref + c.idx}
                x={(c.minTime - minTime) * step}
                y="0"
                width={(c.data as IPitInfo).laneTime * step}
                height={20}
                style={{ fill: "green" }}
              />
            );
          })}
        {combined
          // .slice(0, 1)
          .filter((c) => c.type === "stint")
          .map((c) => {
            return (
              <Tooltip
                color={c.color}
                overlay={
                  <StintTooltip
                    stintInfo={c.data as IStintInfo}
                    no={c.idx}
                    driver={findDriverByStint(currentCarInfo, c.data as IStintInfo)?.driverName ?? "n.a."}
                  />
                }
              >
                <rect
                  key={c.ref + c.idx}
                  x={(c.minTime - minTime) * step}
                  y="0"
                  width={(c.data as IStintInfo).stintTime * step}
                  height={20}
                  style={{ fill: c.color }}
                />
              </Tooltip>
            );
          })}
      </g>
      <g transform="translate(0 35) ">
        {combined
          .filter((c) => c.type === "pit")
          .map((c) => {
            const pit = c.data as IPitInfo;
            return (
              <text
                key={"t" + c.ref + c.idx}
                x={(c.minTime - minTime + pit.laneTime / 2) * step}
                y="0"
                textAnchor="middle"
              >
                {secAsMMSS(pit.laneTime)}
              </text>
            );
          })}
      </g>
    </svg>
  );

  return <>{InternalGraph}</>;
};

export default StintStretch;
