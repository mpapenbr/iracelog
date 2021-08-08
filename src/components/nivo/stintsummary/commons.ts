import { IDriverInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
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
