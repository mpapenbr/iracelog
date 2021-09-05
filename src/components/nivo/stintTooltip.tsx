import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import React from "react";
import { secAsHHMMSS } from "../../utils/output";

interface MyProps {
  no: number;
  stintInfo: IStintInfo;
  driver: string;
}
const StintTooltip: React.FC<MyProps> = (props: MyProps) => {
  return (
    <div className="iracelog-stint-tooltip">
      <strong>
        #{props.stintInfo.carNum} Stint {props.no}
      </strong>
      <br /> {props.driver}
      <br />
      Lap {props.stintInfo.lapExit} - {props.stintInfo.lapEnter} (
      {props.stintInfo.lapEnter - props.stintInfo.lapExit + 1})
      <br />
      {secAsHHMMSS(props.stintInfo.exitTime)} - {secAsHHMMSS(props.stintInfo.enterTime)}
    </div>
  );
};

export default StintTooltip;
