import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import _ from "lodash";
import * as React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { IPitInfo } from "../../stores/racedata/types";
import { assignCarColors } from "./colorAssignment";

type TrackPosData = {
  carNum: string;
  trackPos: number;
  state: string;
  pos: number;
  pic: number;
  lap: number;
};

interface MyProps {
  showCars: string[];
  referenceCarNum: string;
  trackPos: number;
}

export const ZoomTrackPos: React.FC<MyProps> = (props: MyProps) => {
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const trackInfo = useSelector((state: ApplicationState) => state.raceData.trackInfo);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);

  const dataRaw: TrackPosData[] = carsRaw.map((c: any, idx: number) => ({
    carNum: getValueViaSpec(c, stateCarManifest, "carNum"),
    trackPos: getValueViaSpec(c, stateCarManifest, "trackPos"),
    state: getValueViaSpec(c, stateCarManifest, "state"),
    pos: idx,
    pic: getValueViaSpec(c, stateCarManifest, "pic"),
    lap: getValueViaSpec(c, stateCarManifest, "lap"),
  }));
  const data = dataRaw.filter((c) => props.showCars.includes(c.carNum));
  // console.log(data);

  // for each car class the catcolors are assigned from scratch
  const carColors = assignCarColors(carInfos);

  const boxWidth = 500;
  const boxHeight = 50;
  const baseLine = boxHeight - 20; // this is where the line is drawn.
  const margin = 30;
  const emphasizeHeight = 30;
  const emphasizeWidth = 4;
  const standardHeight = 15;
  const standardWidth = 2;
  const deltaRange = 100; // show other cars within +/- meters relative to reference car
  const pixelPerM = boxWidth / (deltaRange * 2);
  const deltaTrackPos = deltaRange / trackInfo.trackLength;
  const referenceCar = dataRaw.find((c) => c.carNum === props.referenceCarNum) ?? {
    carNum: props.referenceCarNum,
    trackPos: -1,
    state: "",
    pos: -1,
    pic: -1,
    lap: -1,
  };

  const posInViewArea = (refPos: number, otherPos: number): boolean => {
    const localDelta = otherPos - refPos > 0.5 ? 1 - otherPos + refPos : refPos - otherPos;
    const localDeltaMeter = localDelta * trackInfo.trackLength;
    return Math.abs(localDeltaMeter) < deltaRange;
  };

  const calcPit = (pit: IPitInfo): number => {
    const pitLen = pit.exit > pit.entry ? pit.exit - pit.entry : 1 - pit.entry + pit.exit;
    return pitLen * trackInfo.trackLength * pixelPerM;
  };
  const pixelOffsetToReference = (refPos: number, otherPos: number): number => {
    // console.log(`refPos: ${refPos} otherPos: ${otherPos}`);
    const localDelta = otherPos - refPos > 0.5 ? 1 - otherPos + refPos : refPos - otherPos;
    const localDeltaMeter = -localDelta * trackInfo.trackLength;
    const offset = localDeltaMeter * pixelPerM;
    return offset;
  };

  const deltaDist = (a: TrackPosData, b: TrackPosData) => a.lap + a.trackPos - (b.lap + b.trackPos);
  const steps = 4;
  console.log("referenceCar is at ", referenceCar);

  const InternalGraph = (
    <svg width={boxWidth + margin} height={boxHeight + margin}>
      {/* complete box for graph-debugging */}
      {/* <rect width={boxWidth + margin} height={boxHeight + margin} style={{ stroke: "black", fillOpacity: 0 }} /> */}
      <g transform={`translate( ${(boxWidth + margin) / 2} 0 )`}>
        <rect width={boxWidth / 2} height={boxHeight + margin} style={{ fill: "red", fillOpacity: 0.05 }} />
      </g>
      <g transform={`translate( ${margin / 2} 0 )`}>
        <rect width={boxWidth / 2} height={boxHeight + margin} style={{ fill: "green", fillOpacity: 0.05 }} />
      </g>

      <g transform={`translate( ${margin / 2} ${margin / 2} )`}>
        {/* "work" box for graph-debugging */}
        {/* <rect width={boxWidth} height={boxHeight} style={{ fill: "lightblue", fillOpacity: 0.1 }} /> */}
        {/* the reference line */}
        <g transform={`translate( 0 ${baseLine} )`}>
          <line x1="0" y1="0" x2={boxWidth} y2={0} style={{ stroke: "grey", fillOpacity: 0 }} />
        </g>
        {/* the reference car */}
        <g transform={`translate( ${(boxWidth - emphasizeWidth) / 2} ${baseLine - emphasizeHeight} )`}>
          <rect
            width={emphasizeWidth}
            height={emphasizeHeight}
            style={{ fill: carColors.get(props.referenceCarNum) }}
          />
          <text y={-3} textAnchor="middle">
            {referenceCar.carNum}
          </text>
        </g>
        {/* the other cars within range */}
        {data
          .filter((c) => c.carNum !== props.referenceCarNum)
          .filter((c) => posInViewArea(props.trackPos, c.trackPos))
          .map((c) => {
            // const localDelta = -deltaDist(referenceCar, c);
            // const localDeltaMeter = localDelta * trackInfo.trackLength;
            // const pixelPerM = boxWidth / (deltaRange * 2);
            // const offset = localDeltaMeter * pixelPerM;
            const offset = pixelOffsetToReference(props.trackPos, c.trackPos);
            // console.log(`${c.carNum}: ${c.trackPos} delta: ${localDelta} in m: ${localDeltaMeter} offset: ${offset} `);
            return (
              <g
                key={`car-${c.carNum}`}
                transform={`translate( ${(boxWidth - standardWidth) / 2 + offset} ${baseLine - standardHeight} )`}
              >
                <rect width={standardWidth} height={standardHeight} style={{ fill: carColors.get(c.carNum) }} />
                <text y={-3} textAnchor="middle">
                  {c.carNum}
                </text>
              </g>
            );
          })}
        {/* the distance marker */}
        {_.range(-steps, steps + 1).map((i) => {
          return (
            <g
              key={`x${i}`}
              transform={`translate(${((i * deltaRange) / steps) * pixelPerM + boxWidth / 2}  ${
                (boxHeight + margin / 2) / 2
              })`}
            >
              <rect width={1} height={2} style={{ fill: "grey" }} />
              <text y={15} textAnchor="middle" style={{ fontSize: 10 }}>
                {`${(deltaRange / 4) * Math.abs(i)}m`}
              </text>
            </g>
          );
        })}
        {/* the sectors  */}

        {eventInfo.sectors
          .filter((s) => posInViewArea(props.trackPos, s.SectorStartPct))
          .map((item) => {
            const sectorMarkerLen = 7;

            const color = "grey";

            const w = 1;
            const h = sectorMarkerLen;

            return (
              <g
                key={`sector-${item.SectorNum}`}
                transform={`translate( ${
                  (boxWidth - w) / 2 + pixelOffsetToReference(props.trackPos, item.SectorStartPct)
                } ${baseLine - sectorMarkerLen / 2})`}
              >
                <rect width={w} height={h} style={{ fill: color }} />
                <text y={15} textAnchor="middle" style={{ fontSize: 10 }}>
                  {item.SectorNum === 0 ? "S/F" : `S${item.SectorNum}`}
                </text>
              </g>
            );
          })}

        {/* the pit area */}
        {trackInfo.pit && trackInfo.pit.entry !== undefined ? (
          <>
            <g
              key={`pit`}
              transform={`translate( ${
                (boxWidth - standardWidth) / 2 + pixelOffsetToReference(props.trackPos, trackInfo.pit.entry)
              } ${baseLine})`}
            >
              <rect width={calcPit(trackInfo.pit)} height={3} style={{ fill: "grey" }} />
            </g>
          </>
        ) : (
          <></>
        )}
      </g>
    </svg>
  );

  return <>{InternalGraph}</>;
};
