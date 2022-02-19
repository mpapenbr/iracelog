import { IDriverInfo, IPitInfo, IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { catPastel1 } from "../../live/colors";

export const commonProps = {
  activeOuterRadiusOffset: 8,
  width: 200,
  height: 200,
  margin: {
    top: 10,
    bottom: 10,
    left: 0,
    right: 0,
  },
};
const colorSet = catPastel1;
export const colorsBySeatTime = (data: IDriverInfo[]) => {
  const seatData = data
    .map((d, idx) => ({
      id: d.driverName,
      label: d.driverName,
      value: d.seatTime.reduce((a, b) => a + b.leaveCarTime - b.enterCarTime, 0),
    }))
    .sort((a, b) => b.value - a.value)
    .map((d, idx) => ({ ...d, color: colorSet[idx % colorSet.length] }));
  return {
    seatTimeData: seatData,
    colorLookup: new Map(
      seatData.map((v) => {
        return [v.id, v.color] as [string, string];
      })
    ),
  };
};

export interface CombinedStintData {
  type: "stint" | "pit";
  data: IStintInfo | IPitInfo;
  ref: number;
  idx: number;
  minTime: number;
  maxTime: number;
  color?: string;
}
export const getCombinedStintData = (
  stints: IStintInfo[],
  pits: IPitInfo[],
  colorLookup: (si: IStintInfo) => string
): CombinedStintData[] => {
  const work: CombinedStintData[] = stints.map((d, idx) => {
    // const driver = findDriverByStint(currentCarInfo, d);

    return {
      type: "stint",
      data: d,
      ref: d.exitTime,
      idx: idx + 1,
      minTime: d.exitTime,
      maxTime: d.enterTime,
      // color: colorLookup.get(driver?.driverName ?? "n.a"),
      color: colorLookup(d),
    };
  });
  const x: CombinedStintData[] = pits.map((d, idx) => ({
    type: "pit",
    data: d,
    ref: d.enterTime,
    idx: idx + 1,
    minTime: d.enterTime,
    maxTime: d.exitTime,
  }));
  const combined = work.concat(x).sort((a, b) => a.ref - b.ref);
  return combined;
};
