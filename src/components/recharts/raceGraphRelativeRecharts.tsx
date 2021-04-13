import { Col, Empty, Row, Select } from "antd";
import _, { isNumber } from "lodash";
import React, { useEffect } from "react";
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
import { DomainTuple } from "victory";
import { ApplicationState } from "../../stores";
import { uiRaceGraphRelativeSettings, uiUpdateBrushSettings } from "../../stores/ui/actions";
import { IBrushInterval, UiComponent } from "../../stores/ui/types";
import { IRaceGraph } from "../../stores/wamp/types";
import CarFilter from "../live/carFilter";
import { strokeColors } from "../live/colors";
import { computeAvailableCars, extractSomeCarData } from "../live/util";

interface IGraphData {
  carNum: string;
  lapNo: number;
  gap: number;
}
const { Option } = Select;

const RaceGraphByReferenceRecharts: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const raceGraph = useSelector((state: ApplicationState) => state.wamp.data.raceGraph);
  const raceOrder = useSelector((state: ApplicationState) => state.wamp.data.raceOrder);
  const uiSettingsAll = useSelector((state: ApplicationState) => state.ui.data.raceGraphRelativeSettings);
  const uiSettings = useSelector((state: ApplicationState) => state.ui.data.raceGraphRelativeSettings.standard);
  const dispatch = useDispatch();

  // this little trick handles the fetching of brushInterval from state, let it be changed here and on leaving this Element store the values in the redux state.
  let brushKeeper: IBrushInterval = { ...uiSettingsAll.brushRange };

  useEffect(() => {
    brushKeeper = { ...uiSettingsAll.brushRange };
    return () => {
      dispatch(uiUpdateBrushSettings(UiComponent.RACE_GRAPH_CAR, { ...brushKeeper }));
    };
  }, []);

  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const dataForCar = (carNum: string) => {
    return wamp.raceGraph.reduce((prev, current) => {
      if (current.carClass.localeCompare("overall") !== 0) return prev;
      const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined && refCarEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          prev.push({ lapNo: current.lapNo, carNum: carNum, gap: carEntry.gap - refCarEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const graphDataOrig = uiSettings.showCars.map((carNum) => dataForCar(carNum));
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
        { lapNo: lapNo }
      )
    );
  });

  const colorCode = (carNum: string): string => {
    return strokeColors[allCarNums.indexOf(carNum) % strokeColors.length];
  };

  const referenceOptions = availableCars.map((d) => (
    <Option key={_.uniqueId()} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...uiSettings, referenceCarNum: value as string };
    dispatch(uiRaceGraphRelativeSettings(curSettings));
  };

  const onSelectCompareCars = (value: any) => {
    const curSettings = { ...uiSettings, showCars: value as string[] };
    dispatch(uiRaceGraphRelativeSettings(curSettings));
  };

  const onSelectCarClassChange = (value: any) => {
    const curSettings = { ...uiSettings, filterCarClasses: value as string[] };
    dispatch(uiRaceGraphRelativeSettings(curSettings));
  };

  const onFilterSecsChange = (value: any) => {
    dispatch(uiRaceGraphRelativeSettings({ ...uiSettings, deltaRange: value }));
  };

  const calcXDom = (rg: IRaceGraph[]): DomainTuple => {
    if (rg.length === 0) return [0, 0];

    return [rg[0].lapNo, _.last(rg)?.lapNo || 0];
  };
  const graphDomain = {
    x: calcXDom(raceGraph),
    y: [-uiSettings.deltaRange, uiSettings.deltaRange] as DomainTuple,
  };
  // from https://www.w3schools.com/lib/w3-colors-2021.css

  const brushChanged = (range: any) => {
    // Note: range is a BrushStartEndIndex but it is not exported. IBrushInterval has the same props
    brushKeeper = range;
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
            style={{ margin: 0, padding: 10, backgroundColor: "white", border: "1px solid rgb(204,204,204)" }}
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
            {uiSettings.showCars.map((carNum) => (
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
            <YAxis />
            <Brush
              dataKey="lapNo"
              height={30}
              stroke="#8884d8"
              onChange={brushChanged}
              startIndex={brushKeeper?.startIndex}
              endIndex={brushKeeper?.endIndex}
            />
            <Tooltip isAnimationActive={false} content={CustomTooltip} />
            <Legend layout="vertical" align="right" verticalAlign="top" />
            <ReferenceLine y={0} stroke="black" />
          </LineChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );

  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={uiSettings.referenceCarNum}
            placeholder="Select reference car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectCompareCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />

        {/* <Col span={4}>
          <InputNumber
            defaultValue={uiSettings.deltaRange}
            precision={0}
            step={10}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterSecsChange}
          />
        </Col> */}
      </Row>

      {uiSettings.referenceCarNum === "" ? <Empty description="Select reference car" /> : InternalRaceGraph}
    </>
  );
};

export default RaceGraphByReferenceRecharts;
