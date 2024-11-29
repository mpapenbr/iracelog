import {
  Car,
  CarState,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_pb";

import * as React from "react";

import { sprintf } from "sprintf-js";

import { CarEntry } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/car/v1/car_pb";
import { theme } from "antd";
import { useAppSelector } from "../../stores";
import { ICarBaseData } from "../../stores/grpc/slices/availableCarsSlice";
import { assignCarColors } from "../live//colorAssignment";
import { cat10Colors } from "../live/colors";

type TrackPosData = {
  carNum: string;
  trackPos: number;
  state: CarState;
  pos: number;
  pic: number;
};

interface MyProps {
  showCars: string[];
  referenceCarNum: string;
  pitstopTime: number;
  circleSize: number;
}
const { useToken } = theme;
// this component should be the new pluggable cod
// NOTE: works only with raceLogger >= 0.5.0
export const CircleOfDoom: React.FC<MyProps> = (props: MyProps) => {
  const carsRaw = useAppSelector((state) => state.classification);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carPits = useAppSelector((state) => state.carPits);
  const carEntries = useAppSelector((state) => state.carEntries);
  const trackInfo = useAppSelector((state) => state.eventInfo.track);
  const carInfos = useAppSelector((state) => state.availableCars);
  const speedmapData = useAppSelector((state) => state.speedmap);
  const carIdxLookup = useAppSelector((state) => state.byIdxLookup);
  const { token } = useToken();
  const carLookup = carInfos.reduce((prev, cur) => {
    return prev.set(cur.carNum, cur);
  }, new Map<string, ICarBaseData>());

  const dataRaw: TrackPosData[] = carsRaw.map((c: Car, idx: number) => ({
    carNum: carIdxLookup.carNum[c.carIdx],
    trackPos: c.trackPos,
    state: c.state,
    pos: idx,
    pic: c.pic,
  }));
  const data = dataRaw.filter((c) => props.showCars.includes(c.carNum));
  // console.log(data);
  // console.table(props);

  // for each car class the catcolors are assigned from scratch
  const carColors = assignCarColors(carInfos);
  const getColor = (carNum: string): string => carColors.get(carNum) ?? "black";

  // const colorCat = strokeColors;
  const colorCat = cat10Colors;
  const circleSize = props.circleSize;
  const margin = 30;
  const emphasizeLen = 40;
  const standardLen = 25;
  const circleExtendSize = 60; // how many pixels do we need on outer circle area
  const circleWidth = 25;

  const OptionalDisplays = () => {
    if (!props.referenceCarNum?.length || dataRaw.length === 0) {
      // console.log("early leave");
      return <></>;
    }
    const carData = carLookup.get(props.referenceCarNum)!;
    // P217: 227 km/h bei 1:02 laptime
    // R8: 198
    // const c = ICarLap;
    let sortedLaps = carLaps
      .find((c) => c.carNum === carData.carNum)
      ?.laps.map((v) => v.lapTime)
      .sort();
    if (sortedLaps === undefined) sortedLaps = [];
    const meanLap = sortedLaps![Math.ceil(sortedLaps!.length / 2)];
    // console.log("meanLap: " + meanLap);
    const avgSpeed = trackInfo.length / meanLap;
    // console.log("avgSpeed: " + avgSpeed);
    const data = dataRaw.find((c) => c.carNum === carData.carNum)!;
    const pitInfo = carPits.find((item) => item.carNum === carData.carNum)!;
    let inPits = 0;
    if (pitInfo && pitInfo.current?.isCurrentPitstop) {
      console.log("car is in pits for " + pitInfo.current.laneTime);
      inPits = pitInfo.current.laneTime;
    }
    // start of pitWindowFrame
    const newPosStart =
      ((1 + data.trackPos - (avgSpeed * (props.pitstopTime - inPits)) / trackInfo.length) % 1) *
      360;
    // start of pitWindowFrame
    const newPosEnd =
      ((1 + data.trackPos - (avgSpeed * (props.pitstopTime + 1 - inPits)) / trackInfo.length) % 1) *
      360;
    const pitwindowMeters = avgSpeed; // we want 1s pit window. lets computer how much that is in meters
    const arc = (pitwindowMeters / trackInfo.length) * 360; // the segment for this pit window in degrees
    // console.log("arc: ", arc);
    // console.log(newPosStart);
    const color = getColor(data.carNum);
    const innerCircle = circleSize - circleExtendSize; // we want the pit box just one pixel below the COD
    const x = Math.trunc(Math.cos((arc * Math.PI) / 180.0) * innerCircle);
    const y = Math.trunc(Math.sin((arc * Math.PI) / 180.0) * innerCircle);
    const xp = innerCircle - x;
    const yp = y;
    return (
      <>
        <text
          x={circleSize}
          y={circleSize}
          textAnchor="middle"
          style={{ fill: token.colorTextLabel }}
        >
          {carData.name}
        </text>
        <g transform={`rotate(${90 + newPosStart} ${circleSize} ${circleSize} )`}>
          <path
            d={`M ${
              circleSize - innerCircle + 1
            } ${circleSize}  a ${innerCircle} ${innerCircle} 0 0 0 ${xp} ${yp}  `}
            stroke={color}
            fill={color}
            opacity={0.5}
            strokeWidth="40"
          />
        </g>

        {/* boundaries in original color */}
        <g transform={`rotate(${newPosStart} ${circleSize} ${circleSize})`}>
          <rect x={circleSize} y={38} width={3} height={45} style={{ fill: color }} />
        </g>
        <g transform={`rotate(${newPosEnd} ${circleSize} ${circleSize})`}>
          <rect x={circleSize} y={38} width={3} height={45} style={{ fill: color }} />
        </g>
      </>
    );
  };

  const Sectors = () => {
    if (!trackInfo.sectors.length) {
      return <></>;
    }
    const sectorMarkerLen = circleWidth + 15;
    return (
      <>
        {trackInfo.sectors.map((item) => {
          const pos = item.startPct * 360;
          const color = "grey";

          const w = 1;
          const h = sectorMarkerLen;
          const y = circleExtendSize - h / 2;
          return (
            <g key={`sector-${item.num}`} transform={`rotate(${pos} ${circleSize} ${circleSize})`}>
              <rect x={circleSize} y={y} width={w} height={h} style={{ fill: color }} />
            </g>
          );
        })}
      </>
    );
  };
  const PitBox = () => {
    if (trackInfo.pitInfo === undefined || trackInfo.pitInfo.entry === -1) {
      return <></>;
    } else {
      // console.log(`entry: ${trackInfo.pit.entry} exit: ${trackInfo.pit.exit}`);
      const pitLen = trackInfo.pitInfo.exit + 1 - trackInfo.pitInfo.entry;

      const arc = pitLen * 360;

      const innerCircle = circleSize - circleExtendSize - circleWidth / 2 - 1; // we want the pit box just one pixel below the COD

      const x = Math.trunc(Math.cos((arc * Math.PI) / 180.0) * innerCircle);
      const y = Math.trunc(Math.sin((arc * Math.PI) / 180.0) * innerCircle);
      const xp = innerCircle - x;
      const yp = y;
      // console.log(`innerCircle: ${innerCircle} len: ${pitLen} winkel: ${arc} x:${x} y: ${y}`);
      return (
        <g>
          <g
            transform={`rotate(${
              90 + Math.trunc(trackInfo.pitInfo.exit * 360)
            } ${circleSize} ${circleSize} )`}
          >
            <path
              d={`M ${
                circleSize - innerCircle
              } ${circleSize}  a ${innerCircle} ${innerCircle} 0 0 0 ${xp} ${yp}  `}
              stroke="grey"
              fill="none"
              strokeWidth="3"
            />
          </g>
        </g>
      );
    }
  };

  // const getColor = (carNum: string): string => colorCat[allCarNums.indexOf(carNum) % colorCat.length];

  interface IntervalData {
    pos: number;
    meter: number;
    sec: number;
    degree: number;
  }
  const Intervals = () => {
    const trackposData = data
      .filter((item) => [CarState.RUN, CarState.SLOW].includes(item.state))
      .sort((a, b) => a.trackPos - b.trackPos);
    if (trackposData.length < 2) return <></>;

    // we draw interval info only if speedmapData is complete (mostly after lap 1)
    if (
      Object.keys(speedmapData.data).length == 0 ||
      Object.entries(speedmapData.data).filter((item) => item[1].laptime === 0).length > 0
    ) {
      return <></>;
    }

    const entryLookup: { [key: string]: CarEntry } = carEntries.reduce(
      (prev, cur) => ({ ...prev, [cur.car?.carNumber!]: cur }),
      {},
    );

    const deltaRaw = trackposData.reduce((prev, cur, curIdx) => {
      // a is the car which should be computed, b the previous car regarding to track position
      const compute = (a: TrackPosData, b: TrackPosData): IntervalData => {
        const delta =
          a.trackPos < b.trackPos ? 1 - b.trackPos + a.trackPos : a.trackPos - b.trackPos;

        const pos = (b.trackPos + delta / 2) % 1; // the middle position between two entries

        const meter = delta * trackInfo.length;
        const degree = (meter / trackInfo.length) * 360; // the segment degrees
        const curA = entryLookup[a.carNum];
        const aChunk = Math.round((a.trackPos * trackInfo.length) / speedmapData.chunkSize);
        const bChunk = Math.round((b.trackPos * trackInfo.length) / speedmapData.chunkSize);

        const x = speedmapData.data[curA.car!.carClassId.toString()].chunkSpeeds;
        // console.log("speedmapData: ", speedmapData, " class: ", curA.car.carClassId, " data: ", x);
        const computeSlice =
          aChunk > bChunk
            ? x.slice(bChunk, aChunk)
            : x.slice(-(x.length - bChunk)).concat(x.slice(0, aChunk));
        // console.log("computeSlice: ", computeSlice);
        const sec = computeSlice.reduce(
          (prev, cur) => prev + speedmapData.chunkSize / (cur / 3.6),
          0,
        );

        return { pos: pos, meter: meter, sec: sec, degree: degree };
      };
      if (curIdx == 0) {
        prev = prev.concat(compute(cur, trackposData.slice(-1)[0]));
      } else {
        prev = prev.concat(compute(cur, trackposData[curIdx - 1]));
      }

      return prev;
    }, [] as IntervalData[]);

    return (
      <>
        {deltaRaw.map((item, idx) => (
          <g
            key={"delta" + idx}
            transform={`rotate(${item.pos * 360} ${circleSize} ${circleSize})`}
          >
            <g transform={`translate(${circleSize} ${circleExtendSize - 0})`}>
              {/* <text x={circleSize} y={circleExtendSize - 10} textAnchor="middle"> */}

              <g transform={`rotate(${-item.pos * 360})`}>
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  style={{ fill: "darkorange" }}
                >
                  {sprintf("%.1f", item.sec)}
                </text>
              </g>
            </g>
          </g>
        ))}
      </>
    );
  };
  const InternalGraph = (
    <svg width={2 * circleSize + margin} height={2 * circleSize + margin}>
      <g transform="translate( 15 10 ) ">
        {/* <circle cx={circleSize} cy={circleSize} r={circleSize} style={{ stroke: "white", fillOpacity: 0 }} /> */}
        <circle
          cx={circleSize}
          cy={circleSize}
          r={circleSize - circleExtendSize}
          style={{
            stroke: "lightgrey",
            strokeOpacity: 0.2,
            fillOpacity: 0,
            strokeWidth: circleWidth,
          }}
        />
        <Sectors />
        {data
          .filter((item) => [CarState.RUN, CarState.SLOW].includes(item.state))
          .map((item) => {
            const pos = item.trackPos * 360;
            const color = getColor(item.carNum);

            // standard for leader
            let w = item.pos === 0 ? 4 : 2;
            let h = item.pos === 0 ? emphasizeLen : standardLen;
            if (props.referenceCarNum === item.carNum) {
              w = 6;
              h = emphasizeLen + 3;
            }
            const y = circleExtendSize - h + standardLen / 2;
            return (
              <g
                key={`car-${item.carNum}`}
                transform={`rotate(${pos} ${circleSize} ${circleSize})`}
              >
                <rect x={circleSize} y={y} width={w} height={h} style={{ fill: color }} />

                <g transform={`translate(${circleSize} ${y - 17})`}>
                  <g transform={`rotate(${-pos} ${w / 2} 0)`}>
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle" /* transform={`rotate(-${pos} 250 5) translate(0 5 )`} */
                      alignmentBaseline="central"
                      style={{ fontSize: 20, fontWeight: "bold", fill: token.colorTextLabel }}
                    >
                      {item.carNum}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}

        <Intervals />
        <PitBox />

        {data
          .filter((item) => [CarState.PIT].includes(item.state))
          .map((item) => {
            const pos = item.trackPos * 360;
            const color = getColor(item.carNum);
            // standard for leader
            let w = item.pos == 0 ? 4 : 2;
            let h = item.pos == 0 ? emphasizeLen : standardLen;
            if (props.referenceCarNum === item.carNum) {
              w = 6;
              h = emphasizeLen + 3;
            }
            const y = circleExtendSize + circleWidth / 2 + 2;
            return (
              <g
                key={`car-${item.carNum}`}
                transform={`rotate(${pos} ${circleSize} ${circleSize})`}
              >
                <rect x={circleSize} y={y} width={w} height={h} style={{ fill: color }} />
                <text
                  x={circleSize}
                  y={y + h + 15}
                  textAnchor="middle" /* transform={`rotate(-${pos} 250 5) translate(0 5 )`} */
                  style={{ fill: token.colorTextLabel }}
                >
                  {item.carNum}
                </text>
              </g>
            );
          })}
        <OptionalDisplays />
      </g>
    </svg>
  );

  return <>{InternalGraph}</>;
};
