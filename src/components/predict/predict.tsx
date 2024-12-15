import { Empty } from "antd";

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

const PredictRaceSvg: React.FC<MyProps> = (props: MyProps) => {
  return <Empty description="TBD" />;
};
export default PredictRaceSvg;
