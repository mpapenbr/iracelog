import { Part, StintPart } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import React from "react";
import { lapTimeString, secAsHHMMSS } from "../../utils/output";
import { durToSec } from "./util";

interface MyProps {
  no: number;
  carNum: string;
  part: Part;
  avgLap: number;
  displayTime?: (sec: number) => string;
}
const PredictStintTooltip: React.FC<MyProps> = (props: MyProps) => {
  const dispTime = props.displayTime ?? secAsHHMMSS;
  const stintInfo = props.part.partType.value as StintPart;
  return (
    <div className="iracelog-stint-tooltip">
      <strong>
        #{props.carNum} Stint {props.no}
      </strong>
      <br />
      Lap {stintInfo.lapStart} - {stintInfo.lapEnd}&nbsp;
      {`(${stintInfo.laps}@${lapTimeString(props.avgLap)})`}
      <br />
      {dispTime(durToSec(props.part.start!))} - {dispTime(durToSec(props.part.end!))}
    </div>
  );
};

export default PredictStintTooltip;
