import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import React from "react";
import { lapTimeString, secAsHHMMSS } from "../../utils/output";

interface MyProps {
  no: number;
  carNum: string;
  stintInfo: IStintInfo;
  driver: string;
  avgLap?: number;
}
const StintTooltip: React.FC<MyProps> = (props: MyProps) => {
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
      {secAsHHMMSS(props.stintInfo.exitTime)} - {secAsHHMMSS(props.stintInfo.enterTime)}
    </div>
  );
};

export default StintTooltip;
