import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Empty, Radio, RadioChangeEvent, Row, Select } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";
import { driverStintsSettings } from "../../stores/ui/actions";
import { IBrushInterval } from "../../stores/ui/types";
import { lapTimeString } from "../../utils/output";
import { getCarStints } from "../live/util";

interface IGraphData {
  carNum: string;
  lapNo: number;
  lapTime: number;
}

const { Option } = Select;
interface MyProps {
  carNum?: string;
}
const StintLapsRecharts: React.FC<MyProps> = (props: MyProps) => {
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);

  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.driverStints);
  const dispatch = useDispatch();
  const [brushKeeper, setBrushKeeper] = useState({} as IBrushInterval);

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

      return found.laps.map((v) => ({ carNum: carNum, lapNo: v.lapNo, lapTime: getValue(v.lapTime) }));
    } else return [];
  };
  const carNum = props.carNum;
  const stints = getCarStints(carStints, carNum ?? "");
  const graphDataOrig = dataForCar(carNum ?? "");

  // outsource
  const floatAvgRaw = (data: IGraphData[]): Map<number, { avg: number }> =>
    data
      .reduce(
        (prev, cur, idx) => {
          // {sum:number, avg:number}
          const cum = prev[prev.length - 1].sum + cur.lapTime;
          prev.push({ sum: cum, avg: cum / prev.length, lapNo: cur.lapNo });
          return prev;
        },
        [{ lapNo: 0, sum: 0, avg: 0 }]
      )
      .slice(1) // remove the 0 entry
      .reduce((prev, cur) => {
        prev.set(cur.lapNo, { avg: cur.avg });
        return prev;
      }, new Map<number, { avg: number }>());
  // outsource
  const extractLapRange = (a: IGraphData[], s: IStintInfo): IGraphData[] => {
    const start = a.findIndex((v) => v.lapNo === s.lapExit); // yes this is the start of the stint (meaning: leaving the pits)
    const end = a.findIndex((v) => v.lapNo === s.lapEnter);
    // console.log("Stint:", { s }, " start:", start, " end:", end);
    return a.slice(start, end === -1 ? a.length : end + 1); // may happen on last stint
  };

  const cur = graphDataOrig
    .reduce((prev, cur) => {
      return prev.concat([cur.lapTime]);
    }, [] as number[])
    .sort((a, b) => a - b);
  const yDomain = [Math.floor(cur[0]), Math.ceil(cur[cur.length >> 1] + uiSettings.filterSecs)];
  // console.log(yDomain);
  interface MyData {
    [x: string]: number;
  }

  const byLapLookup = graphDataOrig.reduce((prev, cur) => {
    graphDataOrig.forEach((gd) => {
      if (!prev.has(gd.lapNo)) {
        prev.set(gd.lapNo, [{ ["#" + gd.carNum]: gd.lapTime }]);
      } else {
        prev.set(gd.lapNo, prev.get(gd.lapNo)!.concat({ ["#" + gd.carNum]: gd.lapTime }));
      }
    });
    return prev;
  }, new Map<number, MyData[]>());

  const mergeFloatingAvgs = (avgData: Map<number, { avg: number }>) => {
    avgData.forEach((v, k) => {
      if (k > 0) {
        const newVal = byLapLookup.get(k) ? byLapLookup.get(k)!.concat({ ...v }) : [{ ...v }];
        //  ? byLapLookup.get(k)!.concat({ "avg": v }) : [{avg:v}];
        byLapLookup.set(k, newVal);
      }
    });
  };
  stints.forEach((s) => {
    const stint = extractLapRange(graphDataOrig, s);
    const processStint = stint.slice(1, -1);
    if (processStint.length > 0) {
      mergeFloatingAvgs(floatAvgRaw(processStint));
    }
  });

  const laps = [] as any[];
  byLapLookup.forEach((v, lapNo) => {
    laps.push(
      v.reduce(
        (prev, cur) => {
          return { ...prev, ...cur };
        },
        { lapNo: lapNo }
      )
    );
  });
  // console.log(laps);

  let timerId: any;
  const brushChanged = (range: any) => {
    // Note: range is a BrushStartEndIndex but it is not exported. IBrushInterval has the same props
    // setBrushKeeper(range);
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      setBrushKeeper(range);
    }, 500);
  };

  const onStintNoChange = (e: RadioChangeEvent) => {
    const stintIdx = e.target.value as number;
    const range =
      stintIdx === 0
        ? {}
        : {
            startIndex: stints[stintIdx - 1].lapExit - 1,
            endIndex: Math.min(stints[stintIdx - 1].lapEnter - 1, laps.length - 1),
          };
    // console.log("Stint: " + stintIdx + "-", range);
    setBrushKeeper(range);
    const curSettings = { ...uiSettings, showStint: stintIdx };
    dispatch(driverStintsSettings(curSettings));
  };
  const StintRadios = (
    <Radio.Group onChange={onStintNoChange} defaultValue={0} value={uiSettings.showStint}>
      <Radio.Button key={0} value={0}>
        All
      </Radio.Button>
      {stints.map((s, idx) => (
        <Radio.Button key={idx + 1} value={idx + 1}>
          {idx + 1}
        </Radio.Button>
      ))}
    </Radio.Group>
  );

  const CustomTooltip = (x: any) => {
    // console.log(x);
    /*
    we get a structure like this:
    {
      active:bool,
      label:number, // the "x" value
      payload: {
        name: "#171" // my carNum
        color:
        fill:
        payload: // the actual for that x value data, e.g. {lapNo: 26, avg: 118.88057066665786, #171: 118.6949}
        value: the "y" value
      }[]
    }
    */
    const { active, payload } = x;
    if (active && payload && payload.length) {
      const lapNo = x.label;
      const dataCar = x.payload[0];
      const dataAvg = x.payload.length > 1 ? x.payload[1] : undefined;

      const data = [] as IGraphData[]; // graphDataByLapLookup.get(lapNo);
      if (data !== undefined) {
        return (
          <div
            className="custom-tooltip"
            style={{ margin: 0, padding: 10, backgroundColor: "white", border: "1px solid rgb(204,204,204)" }}
          >
            <p className="custom-tooltip">Lap {lapNo}</p>
            <table cellPadding={1}>
              <tbody>
                <tr style={{ color: dataCar.color }}>
                  <td align="right">{dataCar.name}</td>
                  <td align="right">{lapTimeString(dataCar.value)}</td>
                </tr>
                {dataAvg ? (
                  <tr style={{ color: dataAvg.color }}>
                    <td align="right">{dataAvg.name}</td>
                    <td align="right">{lapTimeString(dataAvg.value)}</td>
                  </tr>
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>
        );
      } else return <p>No data for lap {lapNo}</p>;
    } else return <></>;
  };

  const InternalLapGraph = (
    <Row gutter={16}>
      <Col span={22}>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart width={1500} height={250} data={laps}>
            {[carNum].map((carNum) => (
              <Line
                key={_.uniqueId()}
                type="monotone"
                isAnimationActive={false}
                dot={false}
                // stroke={colorCode(carNum)}
                stroke="black"
                name={`#${carNum}`}
                dataKey={(d) => {
                  return d["#" + carNum];
                }}
              />
            ))}

            {[carNum].map((carNum) => (
              <Line
                key={_.uniqueId()}
                type="monotone"
                isAnimationActive={false}
                dot={false}
                // stroke={colorCode(carNum)}

                stroke="red"
                name="avg"
                dataKey="avg"
              />
            ))}
            {/* {[carNum].map((carNum) => (
              <Line
                key={_.uniqueId()}
                type="basisOpen" // this will be a basic spline
                isAnimationActive={false}
                dot={false}
                // stroke={colorCode(carNum)}
                stroke="red"
                name={`#${carNum}`}
                dataKey={(d) => {
                  return d["#" + carNum];
                }}
              />
            ))} */}

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lapNo" axisLine={false} />
            {/* <YAxis type="number" /> */}
            {/* <YAxis type="number" domain={[(d: number) => Math.floor(d) - 1, (d: number) => Math.ceil(d) + 1]} /> */}

            <YAxis
              type="number"
              allowDataOverflow={true}
              tickCount={10}
              allowDecimals={false}
              domain={yDomain}
              tickFormatter={(d) => lapTimeString(d)}
            />
            {globalWamp.currentLiveId ? (
              <></>
            ) : (
              <Brush
                dataKey="lapNo"
                height={40}
                stroke="#8884d8"
                onChange={brushChanged}
                startIndex={brushKeeper?.startIndex}
                endIndex={brushKeeper?.endIndex}
              />
            )}
            <Tooltip
              isAnimationActive={false}
              /*
              formatter={(v: number) => {
                return lapTimeString(v);
              }}
              labelFormatter={(v: any) => {
                return "Lap " + v;
              }}
              */
              content={CustomTooltip}
            />
            <Legend layout="vertical" align="right" verticalAlign="top" />
            <ReferenceLine y={0} stroke="black" />
          </LineChart>
        </ResponsiveContainer>
        {StintRadios}
      </Col>
    </Row>
  );

  return <>{carNum && carNum.length > 0 ? InternalLapGraph : <Empty description="Select car" />}</>;
};

export default StintLapsRecharts;
