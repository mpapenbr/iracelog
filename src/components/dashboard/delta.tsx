import { Line } from "@ant-design/charts";
import { Empty } from "antd";
import { isNumber } from "lodash";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";
import { cat10Colors } from "../live/colors";

const Delta: React.FC = () => {
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const raceGraph = useSelector((state: ApplicationState) => state.raceData.raceGraph);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.dashboard);

  const showCars = userSettings.showCars;
  const currentCarLaps = (carNum: string) => carLaps.find((v) => v.carNum === carNum);
  const refCar = userSettings.referenceCarNum;

  if (!refCar) return <Empty description="Select reference car" />;
  if (showCars.length < 2) return <Empty description="not enough data" />;

  interface IGraphData {
    carNum: string;
    lapNo: string; // due to line chart issue https://github.com/ant-design/ant-design-charts/issues/797
    gap: number;
  }

  const dataForCar = (carNum: string) => {
    return raceGraph.reduce((prev, current) => {
      if (current.carClass.localeCompare("overall") !== 0) return prev;
      const refCarEntry = current.gaps.find((gi) => gi.carNum === refCar);
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);
      if (carEntry !== undefined && refCarEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          prev.push({ lapNo: "" + current.lapNo, carNum: carNum, gap: refCarEntry.gap - carEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const graphDataOrig = userSettings.showCars
    .filter((v) => v !== refCar)
    .map((carNum) => dataForCar(carNum))
    .flatMap((a) => [...a]);
  // console.log(graphDataOrig);
  // some strange ant-design/charts bug: https://github.com/ant-design/ant-design-charts/issues/797
  // workaround is to use strings for xaxis...

  const sliderData = globalWamp.currentLiveId ? undefined : { start: 0, end: 1 };
  const animate = globalWamp.currentLiveId ? false : true;
  const noAnimationOption = {
    duration: 0,
  };
  const config = {
    data: graphDataOrig,

    xField: "lapNo",
    yField: "gap",
    seriesField: "carNum",
    // point: {
    //   size: 3,
    //   shape: "diamond",
    // },
    line: { size: 2 },
    colorField: "carNum",
    color: cat10Colors,
    slider: sliderData,
    yAxis: {
      nice: true,

      // minLimit: Math.floor(work.minTime),
      // maxLimit: Math.ceil(work.q95),
      // label: {formatter: (d: number) => lapTimeString(d)},
    },
    interactions: globalWamp.currentLiveId ? [] : [{ type: "brush" }],
    meta: {
      gap: {
        formatter: (d: number) => sprintf("%.1fs", d),
        // minLimit: Math.floor(work.minTime),
        // maxLimit: Math.ceil(work.q95),

        tickCount: 10,
      },
    },

    animate: false,
    animation: {
      appear: noAnimationOption,
      update: noAnimationOption,
      // enter: noAnimationOption,
      // leave: noAnimationOption,
    },
    annotations: [
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "min"] as [string, string],

        style: {
          fill: "green",
        },
        top: true,
      },
      {
        type: "region",
        start: [0, 0] as [number, number],
        end: ["max", "max"] as [string, string],

        style: {
          fill: "red",
        },
        top: true,
      },
    ],
  };

  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return (
    <div>
      <Line {...config} />
    </div>
  );

  // return <Scatter {...config} />;
};

export default Delta;
