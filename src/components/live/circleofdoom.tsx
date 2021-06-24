import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import * as React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { ICarBaseData } from "../../stores/racedata/types";
import { strokeColors } from "./colors";

type TrackPosData = {
  carNum: string;
  trackPos: number;
  state: string;
  pos: number;
  pic: number;
};

export const CircleOfDoom: React.FC<{}> = () => {
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  const trackInfo = useSelector((state: ApplicationState) => state.raceData.trackInfo);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.circleOfDoom);

  const allCarNums = carInfos.map((c) => c.carNum);
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
  const data = dataRaw.filter((c) => userSettings.showCars.includes(c.carNum));
  // console.log(data);

  const OptionalDisplays = () => {
    if (!userSettings.referenceCarNum?.length) {
      return <></>;
    }
    const carData = carLookup.get(userSettings.referenceCarNum)!;
    // P217: 227 km/h bei 1:02 laptime
    // R8: 198
    // const c = ICarLap;
    let sortedLaps = carLaps
      .find((c) => c.carNum === carData.carNum)
      ?.laps.map((v) => v.lapTime)
      .sort();
    if (sortedLaps === undefined) sortedLaps = [];
    const meanLap = sortedLaps![Math.ceil(sortedLaps!.length / 2)];
    console.log("meanLap: " + meanLap);
    const avgSpeed = eventInfo.trackLength / meanLap;
    console.log("avgSpeed: " + avgSpeed);
    const data = dataRaw.find((c) => c.carNum === carData.carNum)!;
    const pitInfo = carPits.find((item) => item.carNum === carData.carNum)!;
    let inPits = 0;
    if (pitInfo && pitInfo.current.isCurrentPitstop) {
      console.log("car is in pits for " + pitInfo.current.laneTime);
      inPits = pitInfo.current.laneTime;
    }
    const newPos =
      ((1 + data.trackPos - (avgSpeed * (userSettings.pitstopTime - inPits)) / eventInfo.trackLength) % 1) * 360;

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
    if (!eventInfo.sectors.length) {
      return <></>;
    }
    const sectorMarkerLen = 7;
    return (
      <>
        {eventInfo.sectors.map((item) => {
          const pos = item.SectorStartPct * 360;
          const color = "grey";

          let w = 1;
          let h = sectorMarkerLen;
          const y = circleExtendSize - h / 2;
          return (
            <g transform={`rotate(${pos} ${circleSize} ${circleSize})`}>
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

      const innerCircle = circleSize - circleExtendSize - 1; // we want the pit box just one pixel below the COD

      const x = Math.trunc(Math.cos((arc * Math.PI) / 180.0) * innerCircle);
      const y = Math.trunc(Math.sin((arc * Math.PI) / 180.0) * innerCircle);
      const xp = innerCircle - x - 1;
      const yp = y;
      // console.log(`innerCircle: ${innerCircle} len: ${pitLen} winkel: ${arc} x:${x} y: ${y}`);
      return (
        <g>
          <g transform={`rotate(${90 + Math.trunc(trackInfo.pit.exit * 360)} ${circleSize} ${circleSize} )`}>
            <path
              d={`M ${circleSize - innerCircle + 1} ${circleSize}  a ${innerCircle} ${innerCircle} 0 0 0 ${xp} ${yp}  `}
              stroke="grey"
              fill="none"
              strokeWidth="2"
            />
          </g>
        </g>
      );
    }
  };

  const colorCat = strokeColors;
  const circleSize = 150;
  const margin = 30;
  const emphasizeLen = 30;
  const standardLen = 15;
  const circleExtendSize = 60; // how many pixels do we need on outer circle area
  const getColor = (carNum: string): string => colorCat[allCarNums.indexOf(carNum) % colorCat.length];
  const InternalGraph = (
    <svg width={2 * circleSize + margin} height={2 * circleSize + margin}>
      <g transform="translate( 15 10 ) ">
        {/* <circle cx={circleSize} cy={circleSize} r={circleSize} style={{ stroke: "white", fillOpacity: 0 }} /> */}
        <circle
          cx={circleSize}
          cy={circleSize}
          r={circleSize - circleExtendSize}
          style={{ stroke: "grey", fillOpacity: 0 }}
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
            if (userSettings.referenceCarNum === item.carNum) {
              w = 6;
              h = emphasizeLen + 3;
            }
            const y = circleExtendSize - h;
            return (
              <g transform={`rotate(${pos} ${circleSize} ${circleSize})`}>
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
          .filter((item) => ["PIT"].includes(item.state))
          .map((item) => {
            const pos = item.trackPos * 360;
            const color = getColor(item.carNum);
            // standard for leader
            let w = item.pos == 0 ? 4 : 2;
            let h = item.pos == 0 ? emphasizeLen : standardLen;
            if (userSettings.referenceCarNum === item.carNum) {
              w = 6;
              h = emphasizeLen + 3;
            }
            const y = circleExtendSize;
            return (
              <g transform={`rotate(${pos} ${circleSize} ${circleSize})`}>
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
