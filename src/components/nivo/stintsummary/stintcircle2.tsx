import { IPitInfo, IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Pie } from "@nivo/pie";
import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../../stores";
import { secAsHHMMSS } from "../../../utils/output";
import { findDriverByStint, getCarPitStops, getCarStints } from "../../live/util";
import { colorsBySeatTime, commonProps } from "./commons";

interface MyProps {
  carNum?: string;
}

/**
 * provides a circle presentation with combined stints and pitstops
 * @param props
 * @returns
 */
const StintCircleWithPits: React.FC<MyProps> = (props: MyProps) => {
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;

  const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

  interface Combined {
    type: "stint" | "pit";
    data: IStintInfo | IPitInfo;
    ref: number;
    idx: number;
  }
  var work: Combined[] = getCarStints(carStints, props.carNum).map((d, idx) => ({
    type: "stint",
    data: d,
    ref: d.exitTime,
    idx: idx + 1,
  }));
  const x: Combined[] = getCarPitStops(carPits, props.carNum).map((d, idx) => ({
    type: "pit",
    data: d,
    ref: d.enterTime,
    idx: idx + 1,
  }));
  const combined = work.concat(x).sort((a, b) => a.ref - b.ref);
  const pieData = combined.map((d) => {
    if (d.type === "stint") {
      const driver = findDriverByStint(currentCarInfo, d.data as IStintInfo);
      return {
        id: "Stint " + d.idx,
        label: driver?.driverName ?? "n.a.",
        value: d.data.stintTime,
        color: colorLookup.get(driver?.driverName!),
      };
    }
    if (d.type === "pit") {
      return {
        id: "Pit " + d.idx,
        label: "tbd",
        value: (d.data as IPitInfo).laneTime,
        color: "green",
      };
    }
  });

  return (
    <>
      <Pie
        {...commonProps}
        width={200}
        data={pieData}
        colors={{ datum: "data.color" }}
        valueFormat={(d) => secAsHHMMSS(d)}
        padAngle={1}
        innerRadius={0.7}
        // margin={{ top: 20, bottom: 20, left: 20, right: 40 }}
        layers={["arcs"]}
      />
    </>
  );
};

export default StintCircleWithPits;
