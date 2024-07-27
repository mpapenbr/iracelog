import { StintInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";

import { Empty, Tooltip, theme } from "antd";
import _ from "lodash";
import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMM } from "../../utils/output";
import { boxPlotDataFor } from "../live/statsutil";
import { findDriverByStint } from "../live/util";
import StintTooltip from "../nivo/stintTooltip";
import { ICarCombinedStintData } from "../nivo/stintsummary/commons";

interface MyProps {
  width?: number;
  height?: number;
  showCarNum?: boolean;
  // minLapTime: number; // already external computed values to be used
  // maxLapTime: number; // already external computed values to be used
  minTime: number; // already external computed values to be used
  maxTime: number; // already external computed values to be used
  combinedStintData: ICarCombinedStintData[];
  showCars: string[];
  hightlightCars: string[];
  toggleHighlightCar: (carNum: string) => void;
}

interface IStintInfoExt extends StintInfo {
  avgLapTime: number;
}
const { useToken } = theme;
const StintRankingSvg: React.FC<MyProps> = (props: MyProps) => {
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const { token } = useToken();
  const width = props.width ?? 800;
  const height = props.height ?? 600;
  const marginLeft = 55;
  const marginBottom = 20;
  const marginRight = 60;
  const marginTop = 10;
  const graphWidth = width - marginLeft - marginRight;
  const graphHeight = height - marginTop - marginBottom;

  const xInfo = Heckbert(props.minTime, props.maxTime, 20);

  const stepX = graphWidth / (xInfo.lmax - xInfo.lmin);

  const combinedAvgLaptimes = props.combinedStintData
    .map((carStints) => {
      return carStints.data
        .filter((v) => v.type == "stint")
        .map((v) => v.avgTime)
        .filter((v) => !Number.isNaN(v));
    })
    .flatMap((v) => [...v]);

  const laptimeStats = boxPlotDataFor(combinedAvgLaptimes);
  // console.log(laptimeStats);

  const yInfo = Heckbert(laptimeStats.minTime, laptimeStats.maxTime, 20);
  // console.log(yInfo);
  // early exit if we don't have enough data
  if (Number.isNaN(yInfo.lmin) || Number.isNaN(yInfo.lmax)) {
    return <Empty description="Not enough data" />;
  }
  const stepY = graphHeight / (yInfo.lmax - yInfo.lmin);

  let haveHighlightCarsToShow = props.hightlightCars && props.hightlightCars.length > 0;
  if (haveHighlightCarsToShow) {
    let found = false;
    for (const carNum of props.hightlightCars) {
      found ||= props.showCars.includes(carNum);
    }
    haveHighlightCarsToShow &&= found;
  }
  const calcOpactity = (carData: ICarCombinedStintData): number => {
    if (haveHighlightCarsToShow) {
      if (props.hightlightCars.includes(carData.carNum)) {
        return 1.0;
      }
      return 0.2;
    }
    return 1.0;
  };
  const carRow = (carData: ICarCombinedStintData) => {
    return carData.data
      .filter((d) => d.type == "stint")
      .map((d, idx) => {
        // const currentCarLaps = carLaps.find((v) => v.carNum === d.data.carNum)!;
        // const laptimes = stintLaps(d.data as IStintInfo, currentCarLaps).flatMap((v) => v.lapTime);
        // const bpData = boxPlotDataFor(laptimes);

        // todo: reuse avg from above computation. create own interface?
        // const avg = computeAvg(d.data as IStintInfo);
        const currentCarInfo = carOccs.find((v) => v.carNum === carData.carNum)!;

        return (
          <Tooltip
            key={"tt-" + carData.carNum + "-" + d.idx}
            color={d.color}
            overlay={
              <StintTooltip
                stintInfo={d.data as StintInfo}
                carNum={carData.carNum}
                no={d.idx}
                driver={findDriverByStint(currentCarInfo, d.data as StintInfo)?.name ?? "n.a."}
                avgLap={d.avgTime}
              />
            }
          >
            <rect
              key={carData.carNum + "_" + d.idx}
              height={5}
              width={(d.data as StintInfo).stintTime * stepX}
              x={(d.data.exitTime - xInfo.lmin) * stepX}
              y={(yInfo.lmax - d.avgTime) * stepY - 2}
              // x={d.eventTime[0] * stepX}
              // y={d.laptime * stepY - minLaptime * stepY}
              style={{ fill: d.color, opacity: calcOpactity(carData) ?? 1.0 }}
            ></rect>
          </Tooltip>
        );
      });
  };
  // check for axis-ticks
  // https://stackoverflow.com/questions/1419194/algorithm-for-nice-graph-labels-for-time-date-axis
  // https://observablehq.com/@littleark/extended-wilkinson-algorithm
  const xAxis = () => {
    return (
      <g transform={`translate(${marginLeft} ${graphHeight + marginTop})`}>
        <line
          key="x-line"
          x1={0}
          x2={graphWidth}
          y={0}
          style={{ strokeWidth: 1, stroke: token.colorTextLabel }}
        />
        {xInfo.ticks.map((d, idx) => (
          <line
            key={`x-line-${idx}`}
            x1={(d - xInfo.lmin) * stepX}
            x2={(d - xInfo.lmin) * stepX}
            y1={0}
            y2={7}
            style={{ strokeWidth: 1, stroke: token.colorTextLabel }}
          />
        ))}
        {xInfo.ticks.map((d, idx) => (
          <text
            key={`x-line-label-${idx}`}
            x={(d - xInfo.lmin) * stepX}
            y={7}
            style={{ fill: token.colorTextLabel }}
            textAnchor="middle"
            alignmentBaseline="hanging"
          >
            {secAsHHMM(d)}
          </text>
        ))}
      </g>
    );
  };

  const yAxis = () => {
    return (
      <g transform={`translate(${marginLeft} ${marginTop})`}>
        <line
          key="y-line"
          x={0}
          y1={0}
          y2={graphHeight}
          style={{ strokeWidth: 1, stroke: token.colorTextLabel }}
        />
        {yInfo.ticks.map((d, idx) => (
          <line
            key={`y-line-${idx}`}
            x1={0}
            x2={-7}
            y1={(yInfo.lmax - d) * stepY}
            y2={(yInfo.lmax - d) * stepY}
            // y2={d * stepY}
            style={{ strokeWidth: 1, stroke: token.colorTextLabel }}
          />
        ))}
        {yInfo.ticks.map((d, idx) => (
          <text
            key={`x-line-label-${idx}`}
            x={-7}
            y={(yInfo.lmax - d) * stepY}
            // style={{ stroke: token.colorTextDescription }}
            style={{ fill: token.colorTextLabel }}
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {lapTimeString(_.round(d, 2))}
          </text>
        ))}
      </g>
    );
  };

  const legend = () => {
    const carNumLabel = 10;
    const barHeight = 12;
    const textHeight = Math.min(12, barHeight);
    return (
      <g transform={`translate(${width - 30} ${marginTop})`}>
        {props.combinedStintData
          .filter((carData) => carData.data.length > 0)
          // .map((carData) => carData.data)
          .map((d, idx) => (
            <g key={`legend-item-${idx}`}>
              <text
                key={`legend-text-${idx}`}
                x={carNumLabel - 2}
                y={idx * 15}
                style={{ fill: token.colorTextLabel }}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                #{d.carNum}
              </text>
              <rect
                key={`legend-line-${idx}`}
                height={5}
                width={20}
                x={carNumLabel}
                y={idx * 15 - 4}
                // x={d.eventTime[0] * stepX}
                // y={d.laptime * stepY - minLaptime * stepY}
                style={{ fill: d.data[0].color, opacity: calcOpactity(d) ?? 1.0 }}
                onClick={() => {
                  if (props.toggleHighlightCar) props.toggleHighlightCar(d.carNum);
                }}
              />
            </g>
          ))}
      </g>
    );
  };

  const MySlider = <></>;

  const InternalGraph = (
    <svg width={width} height={height}>
      <rect
        key="border"
        width={props.width}
        height={props.height}
        style={{ stroke: "pink", fill: "blue", fillOpacity: 0.0 }}
      />
      {xAxis()}
      {yAxis()}
      {legend()}
      <g transform={`translate(${marginLeft} ${marginTop})`}>
        {props.combinedStintData.map((d, idx) => carRow(d))}
        {/* <line
          x1={0}
          x2={100}
          y1={(yInfo.lmax - 137.4) * stepY}
          y2={(yInfo.lmax - 137.4) * stepY}
          // y2={d * stepY}
          style={{ strokeWidth: 1, stroke: "blue" }}
        /> */}
      </g>
    </svg>
  );
  return (
    <>
      {" "}
      {InternalGraph} {MySlider}
    </>
  );
};
export default StintRankingSvg;

// computes ticks for axis (from: https://observablehq.com/@littleark/extended-wilkinson-algorithm)
function Heckbert(dmin: number, dmax: number, ticksNumber = 10) {
  const _ticks = [];

  const nicenum = (x: number, round: boolean) => {
    const e = Math.floor(Math.log10(x));
    const f = x / Math.pow(10, e);
    let nf;
    if (round) {
      if (f < 1.5) nf = 1;
      else if (f < 3) nf = 2;
      else if (f < 7) nf = 5;
      else nf = 10;
    } else {
      if (f <= 1) nf = 1;
      else if (f <= 2) nf = 2;
      else if (f <= 5) nf = 5;
      else nf = 10;
    }
    return nf * Math.pow(10, e);
  };

  const range = nicenum(dmax - dmin, false);
  const lstep = nicenum(range / (ticksNumber - 1), true);
  const lmin = Math.floor(dmin / lstep) * lstep;
  const lmax = Math.ceil(dmax / lstep) * lstep;

  // console.log(this.range, this.lstep, this.lmin, this.lmax)

  for (let tick = lmin; tick <= lmax; tick += lstep) {
    _ticks.push(tick);
  }
  return {
    lmin,
    lmax,
    lstep,
    ticks: _ticks,
  };
}
