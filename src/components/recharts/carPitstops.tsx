import { IPitInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Empty, Row, Select } from "antd";
import _ from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { pitstopsSettings } from "../../stores/ui/actions";
import { secAsMMSS, sortCarNumberStr } from "../../utils/output";
import CarFilter from "../live/carFilter";
import { computeAvailableCars, extractSomeCarData, processCarClassSelection } from "../live/util";

interface IGraphData {
  x: string;
  y: number;
}

const { Option } = Select;
interface IColData {
  value: number | [number, string];
}
const CarPitstopsRecharts: React.FC<{}> = () => {
  const wamp = useSelector((state: ApplicationState) => state.wamp.data);
  const carPits = useSelector((state: ApplicationState) => state.wamp.data.carPits);
  const uiSettings = useSelector((state: ApplicationState) => state.userSettings.pitstops);
  const dispatch = useDispatch();
  const carDataContainer = extractSomeCarData(wamp);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;
  const availableCars = computeAvailableCars(carDataContainer, uiSettings.filterCarClasses);

  const carOrder = [...uiSettings.showCars].sort(sortCarNumberStr);

  const maxPitstops = carPits.reduce((a, b) => (b.history.length > a ? b.history.length : a), 0);

  const dataLookup = carPits.reduce((prev, cur) => {
    const pitstops = [...cur.history].concat(cur.current.isCurrentPitstop ? cur.current : []);
    prev.set(cur.carNum, pitstops);
    return prev;
  }, new Map<string, IPitInfo[]>());

  const dataForCar = (carNum: string): any => {
    const found = carPits.find((v) => v.carNum === carNum);
    if (found !== undefined) {
      const getValue = (v: any): number => {
        if (typeof v === "number") return v;
        else {
          const [vx, info] = v;
          return vx;
        }
      };

      const ret = found.history.map((v, idx) => ({ x: carNum, y: v.laneTime }));
      // console.log(ret);
    } else return [];
  };

  const x0 = _.range(maxPitstops).map((idx) => {
    return carOrder.map((carNum) => {
      const found = carPits.find((v) => v.carNum === carNum);
      if (found === undefined) {
        return { carNum: carNum, laneTime: 0, stintTime: 0 };
      }
      if (idx < found!.history.length) {
        return found!.history[idx];
      } else return { carNum: carNum, laneTime: 0, stintTime: 0 };
    });
  });
  // console.log(x);
  const x = carOrder.map((carNum) => {
    const carData = dataLookup.get(carNum);
    let work = { car: "#" + carNum };
    if (carData !== undefined) {
      carData.forEach((v, idx) => (work = { ...work, ["p" + (idx + 1)]: v.laneTime }));
    }
    return { ...work };
  });

  const dataForCar2 = (carNum: string): any => {
    const found = carPits.find((v) => v.carNum === carNum);
    return found != undefined ? found.history.map((v, idx) => ({ p: idx, ...v })) : [];
  };

  const onSelectShowCars = (value: any) => {
    dispatch(pitstopsSettings({ ...uiSettings, showCars: value as string[] }));
  };

  const onSelectCarClassChange = (value: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelection({
      carDataContainer: carDataContainer,
      currentFilter: uiSettings.filterCarClasses,
      currentShowCars: uiSettings.showCars,
      newSelection: value,
    });
    dispatch(pitstopsSettings({ ...uiSettings, filterCarClasses: value, showCars: newShowcars }));
  };

  // const pits: Map<string, number[]> = new Map();
  // pits.set("1", [12, 20, 14]);

  const pits = [
    { car: "#45", p1: 12, p2: 22, p3: 15 },
    { car: "#77", p1: 10 },
    { car: "#99", p1: 7, p2: 8, p3: 9 },
  ];
  const colorScale = ["Pink", "PaleGoldenrod", "LightGreen"];

  const CustomLabel = (props: any) => {
    console.log(props);
    const { x, y, width, height, value } = props;
    return (
      <text x={x + width / 2} y={y + height / 2} fill="black" /* fontSize={14} */ textAnchor="middle">
        {sprintf("%s", secAsMMSS(value))}
      </text>
    );
  };

  const InternalRaceGraph = (
    <Row gutter={16}>
      <Col span={22}>
        <ResponsiveContainer width="100%" height={750}>
          <BarChart layout="vertical" width={1500} height={750} data={x}>
            {_.range(1, maxPitstops).map((idx) => {
              return (
                <Bar
                  key={_.uniqueId()}
                  isAnimationActive={false}
                  // dot={false}
                  fill={colorScale[idx % colorScale.length]}
                  stackId="pitstop"
                  maxBarSize={50}
                  // label={CustomLabel}
                  // label={(d) => {
                  //   console.log(d);
                  //   return <Label value="xx" />;
                  // }}
                  dataKey={`p${idx}`}
                >
                  {/* <Label value="xx" /> */}
                </Bar>
              );
            })}
            {/* <Bar
              key={_.uniqueId()}
              isAnimationActive={false}
              // dot={false}
              fill="grey"
              stackId="a"
              dataKey="p2"
            /> */}

            <CartesianGrid strokeDasharray="3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="car" />

            {/* <Tooltip isAnimationActive={false} content={CustomTooltip} /> */}
            {/* <Legend layout="vertical" align="right" verticalAlign="top" /> */}
          </BarChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );

  return (
    <>
      <Row>
        <CarFilter
          availableCars={availableCars}
          availableClasses={allCarClasses}
          selectedCars={uiSettings.showCars}
          selectedCarClasses={uiSettings.filterCarClasses}
          onSelectCarFilter={onSelectShowCars}
          onSelectCarClassFilter={onSelectCarClassChange}
        />
      </Row>
      {uiSettings.showCars.length === 0 ? <Empty description="Select cars" /> : InternalRaceGraph}
    </>
  );
};

export default CarPitstopsRecharts;
