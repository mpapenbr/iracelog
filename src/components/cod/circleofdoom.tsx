import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import * as React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { ICarClass, ICarInfo, IEntry } from "../../stores/cars/types";
import { ICarBaseData } from "../../stores/racedata/types";
import { ISpeedmapData } from "../../stores/speedmap/types";
import { assignCarColors } from "../live//colorAssignment";
import { cat10Colors } from "../live/colors";

type TrackPosData = {
  carNum: string;
  trackPos: number;
  state: string;
  pos: number;
  pic: number;
};

interface MyProps {
  showCars: string[];
  referenceCarNum: string;
  pitstopTime: number;
  circleSize: number;
}

// this component should be the new pluggable cod
// NOTE: works only with raceLogger >= 0.5.0
export const CircleOfDoom: React.FC<MyProps> = (props: MyProps) => {
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  const trackInfo = useSelector((state: ApplicationState) => state.raceData.trackInfo);
  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const speedmapData: ISpeedmapData = useSelector(
    (state: ApplicationState) => state.speedmap.speedmapData,
  );
  const carClasses: ICarClass[] = useSelector(
    (state: ApplicationState) => state.carData.carClasses,
  );
  const stateCarData: ICarInfo[] = useSelector((state: ApplicationState) => state.carData.cars);
  const stateEntries: IEntry[] = useSelector((state: ApplicationState) => state.carData.entries);

  const carLookup = carInfos.reduce((prev, cur) => {
    return prev.set(cur.carNum, cur);
  }, new Map<string, ICarBaseData>());
  const dataRaw: TrackPosData[] = carsRaw.map((c: any, idx: number) => ({
    carNum: getValueViaSpec(c, stateCarManifest, "carNum"),
    trackPos: getValueViaSpec(c, stateCarManifest, "trackPos"),
    state: getValueViaSpec(c, stateCarManifest, "state"),
    pos: idx,
    pic: getValueViaSpec(c, stateCarManifest, "pic"),
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
  const emphasizeLen = 45;
  const standardLen = 40;
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
    const avgSpeed = eventInfo.trackLength / meanLap;
    // console.log("avgSpeed: " + avgSpeed);
    const data = dataRaw.find((c) => c.carNum === carData.carNum)!;
    const pitInfo = carPits.find((item) => item.carNum === carData.carNum)!;
    let inPits = 0;
    if (pitInfo && pitInfo.current.isCurrentPitstop) {
      console.log("car is in pits for " + pitInfo.current.laneTime);
      inPits = pitInfo.current.laneTime;
    }
    // start of pitWindowFrame
    const newPosStart =
      ((1 + data.trackPos - (avgSpeed * (props.pitstopTime - inPits)) / eventInfo.trackLength) %
        1) *
      360;
    // start of pitWindowFrame
    const newPosEnd =
      ((1 + data.trackPos - (avgSpeed * (props.pitstopTime + 1 - inPits)) / eventInfo.trackLength) %
        1) *
      360;
    const pitwindowMeters = avgSpeed; // we want 1s pit window. lets computer how much that is in meters
    const arc = (pitwindowMeters / eventInfo.trackLength) * 360; // the segment for this pit window in degrees
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
        <text x={circleSize} y={circleSize} textAnchor="middle">
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
    if (!eventInfo.sectors.length) {
      return <></>;
    }
    const sectorMarkerLen = circleWidth;
    return (
      <>
        {eventInfo.sectors.map((item) => {
          const pos = item.SectorStartPct * 360;
          const color = "grey";

          const w = 1;
          const h = sectorMarkerLen;
          const y = circleExtendSize - h / 2;
          return (
            <g
              key={`sector-${item.SectorNum}`}
              transform={`rotate(${pos} ${circleSize} ${circleSize})`}
            >
              <rect x={circleSize} y={y} width={w} height={h} style={{ fill: color }} />
            </g>
          );
        })}
      </>
    );
  };
  const PitBox = () => {
    if (trackInfo.pit === undefined || trackInfo.pit.entry === -1) {
      return <></>;
    } else {
      // console.log(`entry: ${trackInfo.pit.entry} exit: ${trackInfo.pit.exit}`);
      const pitLen = trackInfo.pit.exit + 1 - trackInfo.pit.entry;

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
              90 + Math.trunc(trackInfo.pit.exit * 360)
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
      .filter((item) => ["RUN", "SLOW"].includes(item.state))
      .sort((a, b) => a.trackPos - b.trackPos);
    if (trackposData.length < 2) return <></>;

    const entryLookup: { [key: string]: IEntry } = stateEntries.reduce(
      (prev, cur) => ({ ...prev, [cur.car.carNumber]: cur }),
      {},
    );

    const deltaRaw = trackposData.reduce((prev, cur, curIdx) => {
      // a is the car which should be computed, b the previous car regarding to track position
      const compute = (a: TrackPosData, b: TrackPosData): IntervalData => {
        const delta =
          a.trackPos < b.trackPos ? 1 - b.trackPos + a.trackPos : a.trackPos - b.trackPos;

        const pos = (b.trackPos + delta / 2) % 1; // the middle position between two entries

        const meter = delta * eventInfo.trackLength;
        const degree = (meter / eventInfo.trackLength) * 360; // the segment degrees
        const curA = entryLookup[a.carNum];
        const aChunk = Math.round((a.trackPos * speedmapData.trackLength) / speedmapData.chunkSize);
        const bChunk = Math.round((b.trackPos * speedmapData.trackLength) / speedmapData.chunkSize);

        const x = speedmapData.data[curA.car.carClassId];
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
          style={{ stroke: "lightgrey", fillOpacity: 0, strokeWidth: circleWidth }}
        />
        <Sectors />
        {data
          .filter((item) => ["RUN", "SLOW"].includes(item.state))
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
                      style={{ fontSize: 20, fontWeight: "bold" }}
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
          .filter((item) => ["PIT"].includes(item.state))
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
