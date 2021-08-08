import { Pie } from "@nivo/pie";
import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../../stores";
import { secAsHHMMSS } from "../../../utils/output";
import { colorsBySeatTime, commonProps } from "./commons";

interface MyProps {
  carNum?: string;
}

const StintSeatTime: React.FC<MyProps> = (props: MyProps) => {
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stintSummary);
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;
  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;

  const totalSeatTime = currentCarInfo.drivers.reduce(
    (prev, cur) => prev + cur.seatTime.reduce((a, b) => a + b.leaveCarTime - b.enterCarTime, 0),
    0
  );

  const myData = colorsBySeatTime(currentCarInfo.drivers);
  const pieProps = {
    ...commonProps,
    width: 400,
    height: 200,
    margin: {
      top: 10,
      bottom: 10,
      left: -200,
      right: 0,
    },
  };

  return (
    <>
      <Pie
        {...pieProps}
        data={myData.seatTimeData}
        colors={{ datum: "data.color" }}
        valueFormat={(d) => secAsHHMMSS(d)}
        tooltip={({ datum: { id, value, color } }) => (
          <div
            style={{
              padding: 12,
              color,
              background: "#ffffff",
            }}
          >
            <strong>
              {id}
              <br />
              {secAsHHMMSS(value)} - {sprintf("%.2f %%", (value * 100.0) / totalSeatTime)}
            </strong>
          </div>
        )}
        theme={{
          tooltip: {
            container: {
              background: "#333",
            },
          },
        }}
        layers={["arcs", "arcLabels", "legends"]}
        legends={[{ anchor: "top-right", direction: "column", itemWidth: 200, itemHeight: 18, translateX: 0 }]}

        // margin={{ top: 20, bottom: 20, left: 30, right: 40 }}
        // sortByValue={true}
      />
    </>
  );
};

export default StintSeatTime;
