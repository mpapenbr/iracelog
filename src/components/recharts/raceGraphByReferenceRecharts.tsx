import { Col, Empty, Row, Select } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";

import { strokeColors } from "../live/colors";

interface IGraphData {
  carNum: string;
  lapNo: number;
  gap: number;
}
const { Option } = Select;

interface MyProps {
  showCars: string[];
  referenceCarNum?: string;
}

const RaceGraphByReferenceRecharts: React.FC<MyProps> = (props) => {
  // const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const raceGraph = useSelector((state: ApplicationState) => state.raceData.raceGraph);

  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraphRelative);

  const { showCars, referenceCarNum } = props;

  const allCarNums = cars.map((c) => c.carNum);
  const dataForCar = (carNum: string) => {
    return raceGraph.reduce((prev, current) => {
      if (current.carClass.localeCompare("overall") !== 0) return prev;
      const refCarEntry = current.gaps.find((gi) => gi.carNum === referenceCarNum);
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined && refCarEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          prev.push({ lapNo: current.lapNo, carNum: carNum, gap: refCarEntry.gap - carEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const graphDataOrig = showCars
    .filter((v) => v !== referenceCarNum)
    .map((carNum) => dataForCar(carNum));
  interface MyData {
    [x: string]: number;
  }
  let byLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [{ ["#" + gd.carNum]: gd.gap }]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat({ ["#" + gd.carNum]: gd.gap }));
      }
    });
    return prev;
  }, new Map<number, MyData[]>());

  let graphDataByLapLookup = graphDataOrig.reduce((prev, cur) => {
    cur.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [gd]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat(gd));
      }
    });
    return prev;
  }, new Map<number, IGraphData[]>());
  graphDataByLapLookup.forEach((v) => v.sort((a, b) => a.gap - b.gap));

  let gaps = [] as any[];
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

  // TODO: move to own file
  const CustomTooltip = (x: any) => {
    const { active, payload } = x;
    if (active && payload && payload.length) {
      const lapNo = x.payload[0].payload.lapNo;
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
                  <tr key={_.uniqueId()} style={{ color: colorCode(v.carNum) }}>
                    <td align="right">#{v.carNum}</td>
                    <td align="right">{sprintf("%.02f", v.gap)}</td>
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
          <LineChart width={1500} height={750} data={gaps}>
            {showCars
              .filter((v) => v !== referenceCarNum)
              .map((carNum) => (
                <Line
                  key={_.uniqueId()}
                  type="monotone"
                  isAnimationActive={false}
                  dot={false}
                  stroke={colorCode(carNum)}
                  name={`#${carNum}`}
                  dataKey={(d) => {
                    return d["#" + carNum];
                  }}
                />
              ))}

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lapNo" axisLine={false} />
            <YAxis
              type="number"
              allowDataOverflow={true}
              tickCount={10}
              allowDecimals={false}
              domain={[-uiSettings.deltaRange, uiSettings.deltaRange]}
            />
            {globalWamp.currentLiveId ? (
              <></>
            ) : (
              <Brush dataKey="lapNo" height={30} stroke="#8884d8" />
            )}
            <Tooltip isAnimationActive={false} content={CustomTooltip} />
            <Legend layout="vertical" align="right" verticalAlign="top" />
            <ReferenceLine y={0} stroke="black" />
          </LineChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );

  return (
    <>{referenceCarNum === "" ? <Empty description="Select reference car" /> : InternalRaceGraph}</>
  );
};

export default RaceGraphByReferenceRecharts;
