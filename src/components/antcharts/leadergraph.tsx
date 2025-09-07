import { Line, LineConfig } from "@ant-design/plots";

import { RaceGraph } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/racegraph_pb";
import { Empty, theme } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { useAppSelector } from "../../stores";
import { assignCarColors } from "../live/colorAssignment";
import { antChartsTheme } from "./color";

interface MyProps {
  showCars: string[];
}
const { useToken } = theme;
const LeaderGraph: React.FC<MyProps> = (props: MyProps) => {
  const availableCars = useAppSelector((state) => state.availableCars);

  const userSettings = useAppSelector((state) => state.userSettings.raceGraph);
  const globalSettings = useAppSelector((state) => state.userSettings.global);
  const raceGraph = useAppSelector((state) => state.raceGraph);
  const { token } = useToken();
  const { showCars } = props;
  // console.log(showCars);
  if (!showCars.length) return <Empty description="Please select cars to show" />;

  const carInfoLookup = Object.assign({}, ...availableCars.map((e) => ({ [e.carNum]: e })));
  const allCarClasses = _.uniq(availableCars.map((e) => e.carClass));
  const allCarNums = availableCars.map((e) => e.carNum);

  interface IGraphData {
    carNum: string;
    lapNo: string; // due to line chart issue https://github.com/ant-design/ant-design-charts/issues/797
    gap: number;
  }

  const dataLookup = raceGraph.reduce((prev, cur) => {
    const entry = prev.get(cur.carClass);
    if (entry !== undefined) {
      prev.set(cur.carClass, entry.concat(cur));
    } else {
      prev.set(cur.carClass, [cur]);
    }
    return prev;
  }, new Map<string, RaceGraph[]>());

  const dataForCar = (carNum: string) => {
    const source: RaceGraph[] =
      userSettings.gapRelativeToClassLeader && allCarClasses.length > 0
        ? dataLookup.get(carInfoLookup[carNum]!.carClass)!
        : dataLookup.get("overall")!;
    if (source === undefined) return [] as IGraphData[];
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          // prev.push({ lapNo: current.lapNo, ["#" + carNum]: carEntry.gap });
          prev.push({ lapNo: "" + current.lapNo, carNum: "#" + carNum, gap: carEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const graphDataOrig = showCars
    // .sort(sortCarNumberStr)
    .map((carNum) => dataForCar(carNum))
    .flatMap((a) => [...a]);

  const carColors = assignCarColors(availableCars);
  const getColor = (carNum: string): string => carColors.get(carNum) ?? "black";
  const localColors = showCars
    // .sort(sortCarNumberStr)
    .filter((carNum) => allCarNums.includes(carNum))
    .map((carNum) => getColor(carNum));

  const sliderData = () => {
    if (globalWamp.currentLiveId) {
      return undefined;
    }
    if (showCars.length > 0) return { x: { start: 0, end: 1 } };
    return undefined;
  };

  const formatDelta = (d: number) => {
    return sprintf("%.1fs", d);
  };
  const range = {
    min: Math.floor(Math.min(_.minBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, -props.deltaRange)),
    max: Math.ceil(Math.max(_.minBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, props.deltaRange)),
  };

  const graphTheme = antChartsTheme(globalSettings.theme);
  const config: LineConfig = {
    data: graphDataOrig,
    height: 700,
    limitInPlot: true,
    xField: "lapNo",
    yField: "gap",
    seriesField: "carNum",
    // point: {
    //   size: 3,
    //   shape: "diamond",
    // },
    // line: { size: 2 },
    colorField: "carNum",
    lineStyle: {
      // lineWidth: 1,
    },
    color: localColors,
    slider: sliderData(),
    theme: graphTheme.antd.theme,

    axis: {
      y: {
        nice: true,
        labelFormatter: formatDelta,
        gridLineWidth: 1,
        gridLineDash: [0, 0],
      },
      x: {
        style: {
          labelTransform: "rotate(0)",
        },
      },
    },
    scale: {
      y: {
        nice: true,
        domainMin: 0,
        domainMax: Math.ceil(
          Math.min(_.maxBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, userSettings.deltaRange),
        ),
      },

      color: {
        range: localColors,
      },
    },
    style: {
      lineWidth: 2,
    },
    tooltip: {
      title: (d) => `Lap ${d.lapNo}`,
      items: [
        {
          channel: "y",
          field: "gap",
          name: "gap",
          valueFormatter: formatDelta,
        },
      ],
    },
    yAxis: {
      nice: true,

      minLimit: 0,
      maxLimit: Math.ceil(
        Math.min(_.maxBy(graphDataOrig, (d) => d.gap)?.gap ?? 0, userSettings.deltaRange),
      ),

      // label: {formatter: (d: number) => lapTimeString(d)},
    },

    interaction: globalWamp.currentLiveId ? {} : { brushFilter: true },
    meta: {
      gap: {
        formatter: (d: number) => sprintf("%.1fs", d),
        minLimit: Math.floor(0),
        maxLimit: Math.min(userSettings.deltaRange),

        tickCount: 9,
      },
      carNum: {
        formatter: (d: string) => "#" + d,
      },
    },

    animate: false,
  };

  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return dataLookup.size > 0 ? (
    <div>
      <Line {...config} />
    </div>
  ) : (
    <Empty />
  );

  // return <Scatter {...config} />;
};

export default LeaderGraph;
