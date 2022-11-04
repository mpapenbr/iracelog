import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import * as React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { strokeColors } from "../live/colors";

type TrackPosData = {
  carNum: string;
  trackPos: number;
  state: string;
  pos: number;
  pic: number;
};
export const TrackPositions: React.FC<{}> = () => {
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const allCarNums = carInfos.map((c) => c.carNum);
  const data: TrackPosData[] = carsRaw.map((c: any, idx: number) => ({
    carNum: getValueViaSpec(c, stateCarManifest, "carNum"),
    trackPos: getValueViaSpec(c, stateCarManifest, "trackPos"),
    state: getValueViaSpec(c, stateCarManifest, "state"),
    pos: idx,
    pic: getValueViaSpec(c, stateCarManifest, "pic"),
  }));
  // console.log(data);
  const InternalGraph = (
    <svg width="100%" height="60">
      {data
        .filter((item) => ["RUN", "SLOW"].includes(item.state))
        .map((item) => {
          const pos = item.trackPos * 100 + "%";
          const color = strokeColors[allCarNums.indexOf(item.carNum) % strokeColors.length];
          const w = item.pos == 0 ? 4 : 2;
          return (
            <g x={pos} y={10} key={item.pos}>
              <rect x={pos} y={0} width={w} height={40} style={{ fill: color }} />
              {/* <circle cx={pos} cy={115} r={15} style={{ stroke: color, fillOpacity: 0 }} /> */}
              <text x={pos} y={40 + 15} textAnchor="middle">
                #{item.carNum}
              </text>
            </g>
          );
        })}
    </svg>
  );

  return <>{InternalGraph}</>;
};
