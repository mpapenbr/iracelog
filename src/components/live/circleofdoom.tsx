import {
  Car,
  CarState,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/racestate/v1/racestate_pb";
import * as React from "react";
import { useAppSelector } from "../../stores";
import { ICarBaseData } from "../../stores/grpc/slices/availableCarsSlice";
import { assignCarColors } from "./colorAssignment";
import { cat10Colors } from "./colors";

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
}

export const CircleOfDoom: React.FC<MyProps> = (props: MyProps) => {
  const carsRaw = useAppSelector((state) => state.classification);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carPits = useAppSelector((state) => state.carPits);
  const trackInfo = useAppSelector((state) => state.eventInfo.track);
  const carInfos = useAppSelector((state) => state.availableCars);
  const carIdxLookup = useAppSelector((state) => state.byIdxLookup);
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
      // console.log("car is in pits for " + pitInfo.current.laneTime);
      inPits = pitInfo.current.laneTime;
    }
    const newPos =
      ((1 + data.trackPos - (avgSpeed * (props.pitstopTime - inPits)) / trackInfo.length) % 1) *
      360;
    // console.log(newPos);
    const color = getColor(data.carNum);
    return (
      <>
        <text x={circleSize} y={circleSize} textAnchor="middle">
          {carData.name}
        </text>
        <g transform={`rotate(${newPos} ${circleSize} ${circleSize})`}>
          <rect x={circleSize} y={40} width={6} height={40} style={{ fill: color }} />
        </g>
      </>
    );
  };

  const Sectors = () => {
    if (!trackInfo.sectors.length) {
      return <></>;
    }
    const sectorMarkerLen = 7;
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

      const innerCircle = circleSize - circleExtendSize - 1 / 2 - 1; // we want the pit box just one pixel below the COD

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
              strokeWidth="2"
            />
          </g>
        </g>
      );
    }
  };

  // const colorCat = strokeColors;
  const colorCat = cat10Colors;
  const circleSize = 150;
  const margin = 30;
  const emphasizeLen = 30;
  const standardLen = 15;
  const circleExtendSize = 60; // how many pixels do we need on outer circle area
  // const getColor = (carNum: string): string => colorCat[allCarNums.indexOf(carNum) % colorCat.length];

  const InternalGraph = (
    <svg width={2 * circleSize + margin} height={2 * circleSize + margin}>
      <g transform="translate( 15 10 ) ">
        {/* <circle cx={circleSize} cy={circleSize} r={circleSize} style={{ stroke: "white", fillOpacity: 0 }} /> */}
        <circle
          cx={circleSize}
          cy={circleSize}
          r={circleSize - circleExtendSize}
          style={{ stroke: "grey", fillOpacity: 0, strokeWidth: 1 }}
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
            const y = circleExtendSize - h;
            return (
              <g
                key={`car-${item.carNum}`}
                transform={`rotate(${pos} ${circleSize} ${circleSize})`}
              >
                <rect x={circleSize} y={y} width={w} height={h} style={{ fill: color }} />
                <text
                  x={circleSize + w / 2}
                  y={y - 5}
                  textAnchor="middle" /* transform={`rotate(-${pos} 250 5) translate(0 5 )`} */
                >
                  {item.carNum}
                </text>
              </g>
            );
          })}
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
            const y = circleExtendSize;
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
