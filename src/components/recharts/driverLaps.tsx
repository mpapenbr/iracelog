import { Col, Empty, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import {
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";
import { lapTimeString } from "../../utils/output";
import { strokeColors } from "../live/colors";

interface IGraphData {
  carNum: string;
  lapNo: number;
  lapTime: number;
}

const { Option } = Select;

const DriverLapsRecharts: React.FC = () => {
  // const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);

  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.driverLaps);

  const allCarNums = cars.map((c) => c.carNum);
  const dataForCar = (carNum: string): IGraphData[] => {
    const found = carLaps.find((v) => v.carNum === carNum);
    if (found !== undefined) {
      const getValue = (v: any): number => {
        if (typeof v === "number") return v;
        else {
          const [vx, info] = v;
          return vx;
        }
      };

      return found.laps.map((v) => ({
        carNum: carNum,
        lapNo: v.lapNo,
        lapTime: getValue(v.lapTime),
      }));
    } else return [];
  };

  const carDataLookup = new Map<string, IGraphData[]>();
  uiSettings.showCars.forEach((carNum) => carDataLookup.set(carNum, dataForCar(carNum)));

  const graphDataOrig = uiSettings.showCars.map((carNum) => dataForCar(carNum));
  interface MyData {
    [x: string]: number;
  }
  const byLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [{ ["#" + gd.carNum]: gd.lapTime }]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat({ ["#" + gd.carNum]: gd.lapTime }));
      }
    });
    return prev;
  }, new Map<number, MyData[]>());

  const graphDataByLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [gd]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat(gd));
      }
    });
    return prev;
  }, new Map<number, IGraphData[]>());

  const gaps = [] as any[];
  byLapLookup.forEach((v, lapNo) => {
    gaps.push(
      v.reduce(
        (cur, prev) => {
          return { ...prev, ...cur };
        },
        { lapNo: lapNo },
      ),
    );
  });

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const cur = graphDataOrig
    .reduce((prev, cur) => _.concat(prev, cur), [])
    .reduce((prev, cur) => {
      return prev.concat([cur.lapTime]);
    }, [] as number[])
    .sort((a, b) => a - b);
  const yDomain = [Math.floor(cur[0]), Math.ceil(cur[cur.length >> 1] + uiSettings.filterSecs)];
  // console.log(yDomain);

  const CustomTooltip = (x: any) => {
    // console.log(x.payload);
    const { active, payload } = x;
    if (active && payload && payload.length) {
      const lapNo = x.payload[0].value;
      const data = graphDataByLapLookup.get(lapNo);
      if (data !== undefined) {
        return (
          <div
            className="custom-tooltip"
            style={{
              margin: 0,
              padding: 10,
              backgroundColor: "white",
              border: "1px solid rgb(204,204,204)",
            }}
          >
            <p className="custom-tooltip">Lap {lapNo}</p>
            <table cellPadding={1}>
              <tbody>
                {data.map((v) => (
                  // <p className="custom-tooltip" style={{ color: colorCode(v.carNum) }}>
                  <tr key={"row-tt-" + v.carNum} style={{ color: colorCode(v.carNum) }}>
                    <td align="right">#{v.carNum}</td>
                    <td align="right">{lapTimeString(v.lapTime)}</td>
                  </tr>
                  // </p>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else return <p>No data for lap {lapNo}</p>;
    } else return <></>;
  };

  const InternalRaceGraph = (
    <Row gutter={16}>
      <Col span={22}>
        <ResponsiveContainer width="100%" height={750}>
          <ScatterChart width={1500} height={750} data={gaps}>
            {uiSettings.showCars.map((carNum) => (
              <Scatter
                key={_.uniqueId()}
                isAnimationActive={false}
                // dot={false}
                fill={colorCode(carNum)}
                name={`#${carNum}`}
                dataKey={(d) => {
                  return d["#" + carNum];
                }}
              />
            ))}

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lapNo" />

            <YAxis
              type="number"
              domain={yDomain}
              tickFormatter={(d) => lapTimeString(d)}
              allowDataOverflow={true}
            />

            {globalWamp.currentLiveId ? (
              <></>
            ) : (
              <Brush dataKey="lapNo" height={30} stroke="#8884d8" />
            )}
            <Tooltip isAnimationActive={false} content={CustomTooltip} />
            <Legend layout="vertical" align="right" verticalAlign="top" />
          </ScatterChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );

  return (
    <>{uiSettings.showCars.length === 0 ? <Empty description="Select car" /> : InternalRaceGraph}</>
  );
};

export default DriverLapsRecharts;
