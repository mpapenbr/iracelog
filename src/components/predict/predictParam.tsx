import {
  PredictParam,
  PredictResult,
  StintPart,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import { Table } from "antd";

import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMMSS } from "../../utils/output";
import { predictDataSorter } from "../../utils/sorter";

interface MyProps {
  width?: number;
  height?: number;
  showCarNum?: boolean;

  showCars: string[];
  hightlightCars: string[];
  toggleHighlightCar: (carNum: string) => void;
}
interface IMyData {
  carNum: string;
  p: PredictParam;
  r: PredictResult;
}

const ShowPredictParam: React.FC<MyProps> = (props: MyProps) => {
  const predict = useAppSelector((state) => state.predict);

  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<IMyData> = [
    {
      key: "carNum",
      title: "Car",
      render: (d: IMyData) =>
        d.carNum == predict.raceLeader.carNum ? d.carNum + " (leader)" : d.carNum,
      align: "left",
    },
    {
      key: "Laptime",
      title: "Laptime",
      render: (d: IMyData) => {
        if (d.p) {
          const lDur = d.p.stint?.avgLaptime!;
          const l = Number(lDur.seconds) + Number(lDur.nanos) / 1e9;
          return lapTimeString(l);
        } else {
          return "n.a.";
        }
      },
      align: "left",
    },
    {
      key: "lps",
      title: "Lps",
      render: (d: IMyData) => {
        return d.p?.stint?.lps;
      },
      align: "left",
    },
    {
      key: "pit",
      title: "PitTime",
      render: (d: IMyData) => {
        if (d.p) {
          const lDur = d.p.pit?.overall!;
          const l = Number(lDur.seconds) + Number(lDur.nanos) / 1e9;
          return lapTimeString(l);
        }
        return "n.a.";
      },
      align: "left",
    },
    {
      key: "laps",
      title: "Laps",
      render: (d: IMyData) => {
        if (d.r) {
          const laps = (_.last(d.r.parts)?.partType.value as StintPart).lapEnd;

          return laps;
        }
        return "n.a.";
      },
      align: "left",
    },
    {
      key: "total",
      title: "Total",
      render: (d: IMyData) => {
        if (d.r) {
          const endTime = Number(_.last(d.r.parts)?.end?.seconds) ?? 0;

          return secAsHHMMSS(endTime);
        }
        return "n.a.";
      },
      align: "left",
    },
    // {
    //   key: "carclass_entries",
    //   title: "Num",
    //   render: (d) => numEntriesLookup[d.id],
    //   width: 10,
    //   align: "right",
    // },
    // {
    //   key: "carclass_sof",
    //   title: "SOF",
    //   render: (d) => sprintf("%.0f", avgiRatingLookup.get(d.id.toString()) ?? 0),
    //   width: 10,
    //   align: "right",
    // },
  ];
  let work = props.showCars;
  if (!work.includes(predict.raceLeader.carNum)) {
    work = work.concat(predict.raceLeader.carNum);
  }
  const myData: IMyData[] = work
    .filter((item) => predict.byCarNum[item])
    .map((carNum) => predict.byCarNum[carNum])
    .sort(predictDataSorter);
  return (
    <>
      <Table
        className="iracelog-compact"
        columns={columns}
        dataSource={myData}
        pagination={false}
        rowKey={(d: IMyData) => d.carNum}
      />
    </>
  );
};
export default ShowPredictParam;
