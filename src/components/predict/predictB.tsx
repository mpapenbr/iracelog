import { Line, LineConfig } from "@ant-design/plots";
import { Part, StintPart } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import { Empty } from "antd";
import { useAppSelector } from "../../stores";

interface MyProps {
  width?: number;
  height?: number;
  showCarNum?: boolean;
  // minLapTime: number; // already external computed values to be used
  // maxLapTime: number; // already external computed values to be used
  minTime: number; // already external computed values to be used
  maxTime: number; // already external computed values to be used

  showCars: string[];
  hightlightCars: string[];
  toggleHighlightCar: (carNum: string) => void;
}

interface IGraphData {
  carNum: string;
  lapNo: string; // due to line chart issue https://github.com/ant-design/ant-design-charts/issues/797
  t: number;
}
const PredictRaceB: React.FC<MyProps> = (props: MyProps) => {
  const predict = useAppSelector((state) => state.predict);
  const lData = predict.raceLeader;
  // console.log(lData);
  let graphData: IGraphData[] = [];
  const createGraphData = (parts: Part[], carNum: string): IGraphData[] => {
    return parts
      .filter((item) => item.partType.case == "stint")
      .reduce((prev, item) => {
        let localGraphData: IGraphData[] = [];

        const startEntry: IGraphData = {
          carNum: carNum,
          lapNo: "" + (item.partType.value as StintPart).lapStart,
          t: Number(item.start?.seconds) ?? 0,
        };
        localGraphData.push(startEntry);
        const help = predict.byCarNum[carNum];
        const avgDur = predict.byCarNum[carNum].p.stint?.avgLaptime!;
        const avg = Number(avgDur.seconds) + Number(avgDur.nanos) / 1e9;
        const left = Number(item.start?.seconds) + Number(item.start?.nanos) / 1e9;
        const right = Number(item.end?.seconds) + Number(item.end?.nanos) / 1e9;

        let next = startEntry.t + avg;
        for (
          let i = (item.partType.value as StintPart).lapStart + 1;
          i < (item.partType.value as StintPart).lapEnd;
          i++
        ) {
          const entry: IGraphData = {
            carNum: carNum,
            lapNo: "" + i,
            t: next,
          };
          next += avg;
          localGraphData.push(entry);
        }

        const endEntry: IGraphData = {
          carNum: carNum,
          lapNo: "" + (item.partType.value as StintPart).lapEnd,
          t: Number(item.end?.seconds) ?? 0,
        };
        localGraphData.push(endEntry);
        return [...prev, ...localGraphData];
      }, [] as IGraphData[]);
  };
  const leaderData = createGraphData(lData.r.parts, lData.carNum).reduce((prev, cur) => {
    return prev.set(cur.lapNo, cur.t);
  }, new Map<string, number>());
  // console.log(xData);
  leaderData.forEach((v, k) => {
    graphData.push({ carNum: "leader", lapNo: k, t: 0 });
  });

  for (const [k, v] of Object.entries(predict.byCarNum)) {
    createGraphData(v.r.parts, k).forEach((item) => {
      const leaderTime = leaderData.get(item.lapNo);
      if (leaderTime) {
        item.t = item.t - leaderTime;
        graphData.push(item);
      }
    });
  }
  graphData.sort((a, b) => parseInt(a.lapNo) - parseInt(b.lapNo));
  // .map((item) => ({lapNo: "12", t:12} as IGraphData))
  // console.log(graphData);
  const config: LineConfig = {
    data: graphData,
    // height: 700,
    xField: "lapNo",
    yField: "t",
    animation: false,
    seriesField: "carNum",
    point: {
      size: 3,
      shape: "diamond",
    },
  };
  return graphData.length > 0 ? <Line {...config} /> : <Empty description="TBD" />;
};
export default PredictRaceB;
