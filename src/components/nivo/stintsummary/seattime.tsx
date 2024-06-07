import { Pie } from "@nivo/pie";
import { Empty, theme } from "antd";
import React from "react";
import { sprintf } from "sprintf-js";
import { useAppSelector } from "../../../stores";
import { secAsHHMMSS } from "../../../utils/output";
import { colorsBySeatTime, commonProps } from "./commons";

interface MyProps {
  carNum?: string;
}
const { useToken } = theme;
const StintSeatTime: React.FC<MyProps> = (props: MyProps) => {
  const carOccs = useAppSelector((state) => state.carOccupancies);

  const carStints = useAppSelector((state) => state.carStints);
  const { token } = useToken();
  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carOccs.find((v) => v.carNum === props.carNum)!;

  const totalSeatTime = currentCarInfo.drivers.reduce(
    (prev, cur) => prev + cur.seatTimes.reduce((a, b) => a + b.leaveCarTime - b.enterCarTime, 0),
    0,
  );

  // const dark = G2.getTheme("dark");
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
        theme={{
          legends: {
            text: {
              fill: token.colorText,
            },
          },
        }}
        tooltip={({ datum: { id, value, color } }) => (
          <div
            style={{
              padding: 12,
              color,
              background: token.colorBgContainer,
            }}
          >
            <strong>
              {id}
              <br />
              {secAsHHMMSS(value)} - {sprintf("%.2f %%", (value * 100.0) / totalSeatTime)}
            </strong>
          </div>
        )}
        layers={["arcs", "arcLabels", "legends"]}
        legends={[
          {
            anchor: "top-right",
            direction: "column",
            itemWidth: 200,
            itemHeight: 18,
            translateX: 0,
          },
        ]}

        // margin={{ top: 20, bottom: 20, left: 30, right: 40 }}
        // sortByValue={true}
      />
    </>
  );
};

export default StintSeatTime;
