import { Pie } from "@nivo/pie";
import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../../stores";
import { secAsHHMMSS } from "../../../utils/output";
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
const StintCircle: React.FC<MyProps> = (props: MyProps) => {
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;

  const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);
  const pieStintData: GraphData[] = getCarStints(carStints, props.carNum).map((d, idx) => {
    const driver = findDriverByStint(currentCarInfo, d);
    return {
      id: "Stint " + (idx + 1),
      label: driver?.driverName ?? "n.a.",
      value: d.stintTime,
      color: colorLookup.get(driver?.driverName ?? "n.a"),
    };
  });

  return (
    <>
      <Pie
        {...commonProps}
        width={200}
        data={pieStintData}
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

export default StintCircle;
