import { StintInfo } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_stint_pb";
import React from "react";
import { lapTimeString, secAsHHMMSS } from "../../utils/output";

interface MyProps {
  no: number;
  carNum: string;
  stintInfo: StintInfo;
  driver: string;
  avgLap?: number;
  displayTime?: (sec: number) => string;
}
const StintTooltip: React.FC<MyProps> = (props: MyProps) => {
  const dispTime = props.displayTime ?? secAsHHMMSS;
  return (
    <div className="iracelog-stint-tooltip">
      <strong>
        #{props.carNum} Stint {props.no}
      </strong>
      <br /> {props.driver}
      <br />
      Lap {props.stintInfo.lapExit} - {props.stintInfo.lapEnter} (
      {props.stintInfo.lapEnter - props.stintInfo.lapExit + 1})
      {props.avgLap ? ` (${lapTimeString(props.avgLap)})` : ""}
      <br />
      {dispTime(props.stintInfo.exitTime)} - {dispTime(props.stintInfo.enterTime)}
    </div>
  );
};

export default StintTooltip;
