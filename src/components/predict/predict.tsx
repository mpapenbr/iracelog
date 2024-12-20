import { Line, LineConfig } from "@ant-design/charts";
import { StintPart } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
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
const PredictRace: React.FC<MyProps> = (props: MyProps) => {
  const predict = useAppSelector((state) => state.predict);
  const lData = predict.raceLeader;
  console.log(lData);
  let graphData: IGraphData[] = [];
  lData.parts
    .filter((item) => item.partType.case == "stint")
    .forEach((item) => {
      const startEntry: IGraphData = {
        carNum: "leader",
        lapNo: "" + (item.partType.value as StintPart).lapStart,
        t: Number(item.start?.seconds) ?? 0,
      };
      graphData.push(startEntry);
      const endEntry: IGraphData = {
        carNum: "leader",
        lapNo: "" + (item.partType.value as StintPart).lapEnd,
        t: Number(item.end?.seconds) ?? 0,
      };
      graphData.push(endEntry);
    });
  for (const [k, v] of Object.entries(predict.byCarNum)) {
    v.parts
      .filter((item) => item.partType.case == "stint")
      .forEach((item) => {
        const startEntry: IGraphData = {
          carNum: k,
          lapNo: "" + (item.partType.value as StintPart).lapStart,
          t: Number(item.start?.seconds) ?? 0,
        };
        graphData.push(startEntry);
        const endEntry: IGraphData = {
          carNum: k,
          lapNo: "" + (item.partType.value as StintPart).lapEnd,
          t: Number(item.end?.seconds) ?? 0,
        };
        graphData.push(endEntry);
      });
  }
  graphData.sort((a, b) => parseInt(a.lapNo) - parseInt(b.lapNo));
  // .map((item) => ({lapNo: "12", t:12} as IGraphData))
  console.log(graphData);
  const config: LineConfig = {
    data: graphData,
    height: 700,
    xField: "lapNo",
    yField: "t",
    seriesField: "carNum",
    point: {
      size: 3,
      shape: "diamond",
    },
  };
  return graphData.length > 0 ? <Line {...config} /> : <Empty description="TBD" />;
};
export default PredictRace;
