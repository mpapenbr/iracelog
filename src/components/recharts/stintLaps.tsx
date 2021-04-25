import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Empty, InputNumber, Radio, RadioChangeEvent, Row, Select } from "antd";
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
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { uiDriverStintSettings } from "../../stores/ui/actions";
import { IBrushInterval } from "../../stores/ui/types";
import { lapTimeString } from "../../utils/output";
import CarClassFilter from "../live/carClassFilter";
import { strokeColors } from "../live/colors";
import { computeAvailableCars, extractSomeCarData, getCarStints } from "../live/util";

interface IGraphData {
  carNum: string;
  lapNo: number;
  lapTime: number;
}

const { Option } = Select;

const StintLapsRecharts: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carLaps = useSelector((state: ApplicationState) => state.wamp.data.carLaps);
  const carInfo = useSelector((state: ApplicationState) => state.wamp.data.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.wamp.data.carStints);
  const uiSettingsAll = useSelector((state: ApplicationState) => state.ui.data.driverLapsSettings);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.driverStintSettings);
  const dispatch = useDispatch();
  const [brushKeeper, setBrushKeeper] = useState({} as IBrushInterval);

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);
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

  let carDataLookup = new Map<string, IGraphData[]>();

  const stints = getCarStints(carStints, uiSettings.carNum);
  const graphDataOrig = dataForCar(uiSettings.carNum);

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
  let carStintRollAvg = new Map<number, { avg: number }>();

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

  let byLapLookup = graphDataOrig.reduce((prev, cur) => {
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

  let laps = [] as any[];
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
  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const referenceOptions = availableCars.map((d) => (
    <Option key={_.uniqueId()} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...uiSettings, carNum: value as string, showStint: 0 };
    dispatch(uiDriverStintSettings(curSettings));
    setBrushKeeper({});
  };

  const onSelectReferenceByTags = (value: any) => {
    const curSettings = { ...uiSettings, showCars: value as string[] };
    dispatch(uiDriverStintSettings(curSettings));
  };

  const onSelectCarClassChange = (value: any) => {
    const curSettings = { ...uiSettings, filterCarClasses: value as string[] };
    dispatch(uiDriverStintSettings(curSettings));
  };

  const onFilterSecsChange = (value: any) => {
    const curSettings = { ...uiSettings, filterSecs: value };
    dispatch(uiDriverStintSettings(curSettings));
  };

  var timerId: any;
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
    dispatch(uiDriverStintSettings(curSettings));
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
            {[uiSettings.carNum].map((carNum) => (
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

            {[uiSettings.carNum].map((carNum) => (
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
            {/* {[uiSettings.carNum].map((carNum) => (
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
            <Brush
              dataKey="lapNo"
              height={40}
              stroke="#8884d8"
              onChange={brushChanged}
              startIndex={brushKeeper?.startIndex}
              endIndex={brushKeeper?.endIndex}
            />

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
  const bla = () => {
    if (uiSettings.carNum) {
    }
  };
  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={uiSettings.carNum ? uiSettings.carNum : undefined}
            placeholder="Select car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarClassFilter
          availableClasses={allCarClasses}
          onSelectCarClassFilter={onSelectCarClassChange}
          selectedCarClasses={uiSettings.filterCarClasses}
        />
        <Col span={4}>
          <InputNumber
            defaultValue={uiSettings.filterSecs}
            precision={0}
            step={1}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>
      {uiSettings.carNum && uiSettings.carNum.length > 0 ? InternalLapGraph : <Empty description="Select car" />}
    </>
  );
};

export default StintLapsRecharts;
