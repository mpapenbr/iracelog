import { Pie } from "@nivo/pie";
import { Empty } from "antd";
import React from "react";
import { useAppSelector } from "../../../stores";
import { findDriverByStint, getCarStints } from "../../live/util";
import { colorsBySeatTime, commonProps } from "./commons";

interface MyProps {
  carNum?: string;
}
interface GraphData {
  id: string | number;
  label: string;
  value: string | number;
  color?: string;
}
const StintLaps: React.FC<MyProps> = (props: MyProps) => {
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const carStints = useAppSelector((state) => state.carStints);
  const carLaps = useAppSelector((state) => state.carLaps);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carOccs.find((v) => v.carNum === props.carNum)!;
  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;
  const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

  const pieStintLapData = Array.from(
    getCarStints(carStints, props.carNum)
      .reduce((prev, cur) => {
        const driver = findDriverByStint(currentCarInfo, cur)!;
        let found = prev.get(driver?.name);
        if (!found) {
          found = { id: driver?.name, label: driver?.name, value: cur.numLaps };
          prev.set(driver?.name, found);
        } else {
          found.value += cur.numLaps;
        }
        return prev;
      }, new Map())
      .values(),
  )
    .sort((a, b) => b.value - a.value)
    .map((d) => ({ ...d, color: colorLookup.get(d.id)! }));

  return (
    <>
      <Pie
        {...commonProps}
        width={200}
        data={pieStintLapData}
        colors={{ datum: "data.color" }}
        padAngle={1}
        innerRadius={0.7}
        // margin={{ top: 20, bottom: 20, left: 20, right: 40 }}
        layers={["arcs", "arcLabels"]}
      />
    </>
  );
};

export default StintLaps;
