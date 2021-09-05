import { Line } from "@ant-design/charts";
import { Types } from "@antv/g2/lib";
import { IRaceGraph } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Empty } from "antd";
import _, { isNumber } from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../../commons/globals";
import { ApplicationState } from "../../stores";
import { sortCarNumberStr } from "../../utils/output";
import { cat10Colors } from "../live/colors";
import { extractSomeCarData2 } from "../live/util";

interface MyProps {
  showCars: string[];
}
const LeaderGraph: React.FC<MyProps> = (props: MyProps) => {
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);

  const carInfos = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const raceGraph = useSelector((state: ApplicationState) => state.raceData.raceGraph);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraph);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const currentCarLaps = (carNum: string) => carLaps.find((v) => v.carNum === carNum);

  const selectSettings = () => {
    // eslint-disable-next-line no-constant-condition
    if (false && stateGlobalSettings.syncSelection) {
      return {
        showCars: stateGlobalSettings.showCars,
        filterCarClasses: stateGlobalSettings.filterCarClasses,
        referenceCarNum: stateGlobalSettings.referenceCarNum,
      };
    } else {
      return {
        showCars: userSettings.showCars,
        filterCarClasses: userSettings.filterCarClasses,
      };
    }
  };
  const { showCars } = props;

  if (!showCars.length) return <Empty description="Please select cars to show" />;

  const carDataContainer = extractSomeCarData2(carInfos);
  const { carInfoLookup, allCarNums, allCarClasses } = carDataContainer;

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
  }, new Map<string, IRaceGraph[]>());

  const dataForCar = (carNum: string) => {
    const source: IRaceGraph[] =
      userSettings.gapRelativeToClassLeader && allCarClasses.length > 0
        ? dataLookup.get(carInfoLookup.get(carNum)!.carClass)!
        : dataLookup.get("overall")!;
    return source.reduce((prev, current) => {
      const carEntry = current.gaps.find((gi) => gi.carNum === carNum);

      // const refCarEntry = current.gaps.find((gi) => gi.carNum === uiSettings.referenceCarNum);
      if (carEntry !== undefined) {
        if (isNumber(carEntry.gap) && !isNaN(carEntry.gap) && carEntry.lapNo > 0) {
          // prev.push({ lapNo: current.lapNo, ["#" + carNum]: carEntry.gap });
          prev.push({ lapNo: "" + current.lapNo, carNum: carNum, gap: carEntry.gap });
        }
      }
      return prev;
    }, [] as IGraphData[]);
  };

  const graphDataOrig = showCars
    .sort(sortCarNumberStr)
    .map((carNum) => dataForCar(carNum))
    .flatMap((a) => [...a]);

  const sliderData = globalWamp.currentLiveId ? undefined : { start: 0, end: 1 };

  const noAnimationOption = {
    duration: 0,
  };

  const config = {
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
    line: { size: 2 },
    colorField: "carNum",
    color: cat10Colors,
    slider: sliderData,
    yAxis: {
      nice: true,

      minLimit: 0,
      maxLimit: Math.ceil(Math.min(_.maxBy(graphDataOrig, (d) => d.gap)!.gap, userSettings.deltaRange)),

      // label: {formatter: (d: number) => lapTimeString(d)},
    },
    tooltip: {
      customItems: (orig: Types.TooltipItem[]) => {
        return orig.sort((a, b) => a.data.gap - b.data.gap);
      },
    },
    interactions: globalWamp.currentLiveId ? [] : [{ type: "brush" }],
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
    animation: {
      appear: noAnimationOption,
      update: noAnimationOption,
      // enter: noAnimationOption,
      // leave: noAnimationOption,
    },
  };

  // note: there is a bug in Line: see https://github.com/ant-design/ant-design-charts/issues/797
  return (
    <div>
      <Line {...config} />
    </div>
  );

  // return <Scatter {...config} />;
};

export default LeaderGraph;
