import { PitInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_pit_pb";
import { StintInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";

import { Tooltip } from "antd";
import React from "react";
import { useAppSelector } from "../../../stores";
import { secAsMMSS } from "../../../utils/output";
import { findDriverByStint } from "../../live/util";
import StintTooltip from "../stintTooltip";
import { CombinedStintData } from "./commons";

interface MyProps {
  carNum?: string;
  width?: number;
  height?: number;
  showCarNum?: boolean;
  minTime: number; // already external computed values to be used
  maxTime: number; // already external computed values to be used
  combinedStintData: CombinedStintData[];
}

/**
 * provides a stretch with combined stints and pitstops
 * @param props
 * @returns
 */
const StintStretch: React.FC<MyProps> = (props: MyProps) => {
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const carStints = useAppSelector((state) => state.carStints);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <></>;
    // return <Empty />;
  }
  const currentCarInfo = carOccs.find((v) => v.carNum === props.carNum)!;
  const combined = props.combinedStintData;

  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const w = props.width ? props.width : 600;
  const h = props.height ? props.height : 50;
  const barHeight = (h - 5) >> 1;
  const textHeight = Math.min(12, barHeight);
  const carNumLabel = props.showCarNum ? 40 : 0;

  const step = (w - carNumLabel) / (maxTime - minTime);
  // console.log(`min: ${minTime}, max: ${maxTime}, step: ${step}`);
  const InternalGraph = (
    <svg width={w} height={h}>
      {props.showCarNum ? (
        <g>
          <text
            key={props.carNum}
            x={carNumLabel - 2}
            y={textHeight + (barHeight - textHeight) / 2}
            fontSize={Math.min(12, textHeight)}
            textAnchor="end"
          >
            {`#${props.carNum}`}
          </text>
        </g>
      ) : (
        <></>
      )}
      <g transform={`translate( ${carNumLabel} 0 )`}>
        <g transform="translate( 0 0) ">
          {combined
            .filter((c) => c.type === "pit")
            .map((c) => {
              return (
                <rect
                  key={c.ref + c.idx}
                  x={(c.minTime - minTime) * step}
                  y="0"
                  width={(c.data as PitInfo).laneTime * step}
                  height={barHeight}
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
                  key={"tt-" + props.carNum + "-" + c.idx}
                  color={c.color}
                  overlay={
                    <StintTooltip
                      carNum={props.carNum ?? "n.a."}
                      stintInfo={c.data as StintInfo}
                      no={c.idx}
                      driver={
                        findDriverByStint(currentCarInfo, c.data as StintInfo)?.name ?? "n.a."
                      }
                    />
                  }
                >
                  <rect
                    key={c.ref + c.idx}
                    x={(c.minTime - minTime) * step}
                    y="0"
                    width={(c.data as StintInfo).stintTime * step}
                    height={barHeight}
                    style={{ fill: c.color }}
                  />
                </Tooltip>
              );
            })}
        </g>
        {/* <g transform={`translate(0 ${pitstopTextOffset})`}> */}
        <g transform={`translate(0 ${barHeight})`}>
          {combined
            .filter((c) => c.type === "pit")
            .map((c) => {
              const pit = c.data as PitInfo;
              return (
                <text
                  key={"t" + c.ref + c.idx}
                  x={(c.minTime - minTime + pit.laneTime / 2) * step}
                  y={textHeight}
                  // y={Math.min(12, barHeight)}
                  // fontSizeAdjust={1.75}
                  fontSize={Math.min(12, textHeight)}
                  textAnchor="middle"
                >
                  {secAsMMSS(pit.laneTime)}
                </text>
              );
            })}
        </g>
      </g>
    </svg>
  );

  return <>{InternalGraph}</>;
};

export default StintStretch;
