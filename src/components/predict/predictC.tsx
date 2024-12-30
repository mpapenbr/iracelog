import { Empty, theme, Tooltip } from "antd";

import { StintPart } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import _ from "lodash";
import { useAppSelector } from "../../stores";
import { hocDisplayTimeByUserSettings } from "../live/util";
import PredictStintTooltip from "./predictTooltip";
import { durToSec } from "./util";

interface MyProps {
  width?: number;
  height?: number;
  showCarNum?: boolean;
  carNum: string;
  minTime: number; // already external computed values to be used
  maxTime: number; // already external computed values to be used
}
const { useToken } = theme;
interface IGraphData {
  carNum: string;
  lapNo: string; // due to line chart issue https://github.com/ant-design/ant-design-charts/issues/797
  t: number;
}
const PredictRaceC: React.FC<MyProps> = (props: MyProps) => {
  const predict = useAppSelector((state) => state.predict);
  const sessionData = useAppSelector((state) => state.session);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const lData = predict.raceLeader;
  // console.log(lData);

  const myParam = predict.byCarNum[props.carNum]?.p;
  const myResult = predict.byCarNum[props.carNum]?.r;
  let graphData: IGraphData[] = [];
  const { token } = useToken();
  const minTime = props.minTime;
  const maxTime = props.maxTime;
  const w = props.width ? props.width : 600;
  const h = props.height ? props.height : 50;
  const barHeight = (h - 5) >> 1;
  const textHeight = Math.min(12, barHeight);
  const carNumLabel = props.showCarNum ? 40 : 0;
  const step = (w - 30 - carNumLabel) / (maxTime - minTime);
  const lFinish = Number(_.last(lData.r.parts)?.end?.seconds);
  if (lData && myResult) {
    const lLaps = (_.last(lData.r.parts)?.partType.value as StintPart).lapEnd;
    const myLaps = (_.last(myResult.parts)?.partType.value as StintPart).lapEnd;
    const myFinish = Number(_.last(myResult?.parts)?.end?.seconds);
    // console.log(`leader ${lFinish} (${lLaps}) me: ${props.carNum} ${myFinish} ${myLaps}`);
  }
  const displayTimeFromSettings = hocDisplayTimeByUserSettings(
    sessionData,
    stateGlobalSettings.timeMode,
  );

  const InternalGraph = (
    <svg width={w} height={h}>
      {props.showCarNum ? (
        <g>
          <text
            key={props.carNum}
            x={carNumLabel - 2}
            y={textHeight + (barHeight - textHeight) / 2}
            fontSize={Math.min(12, textHeight)}
            style={{ fill: token.colorTextLabel }}
            textAnchor="end"
          >
            {`#${props.carNum}`}
          </text>
        </g>
      ) : (
        <></>
      )}
      {myResult ? (
        <g transform={`translate( ${carNumLabel} 0 )`}>
          <g transform="translate( 0 0) "></g>
          {myResult.parts
            .filter((item) => item.partType.case == "stint")
            .map((item, idx) => {
              const left = Number(item.start?.seconds) + Number(item.start?.nanos) / 1e9;
              const right = Number(item.end?.seconds) + Number(item.end?.nanos) / 1e9;
              return (
                <Tooltip
                  key={"tt-" + props.carNum + "-" + idx}
                  overlay={
                    <PredictStintTooltip
                      carNum={props.carNum ?? "n.a."}
                      part={item}
                      no={idx + 1}
                      avgLap={durToSec(myParam.stint?.avgLaptime!)}
                      displayTime={displayTimeFromSettings}
                    />
                  }
                >
                  <rect
                    key={"stint-" + props.carNum + "-" + idx}
                    x={(left - minTime) * step}
                    y="0"
                    width={(right - left) * step}
                    height={barHeight}
                    style={{ fill: "blue", opacity: 0.5 }}
                  />
                </Tooltip>
              );
            })}
          <rect
            key={"lFinish-" + props.carNum}
            x={(lFinish - minTime) * step}
            y="0"
            width={1}
            height={barHeight}
            style={{ fill: "red" }}
          />
        </g>
      ) : (
        <></>
      )}
    </svg>
  );
  return true ? <>{InternalGraph}</> : <Empty description="TBD" />;
};
export default PredictRaceC;
