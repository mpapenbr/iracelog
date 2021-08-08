import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Empty, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../stores";
import { lapTimeString, secAsHHMMSS } from "../utils/output";
import { findDriverByStint, getCarStints } from "./live/util";

interface MyProps {
  carNum?: string;
  // carStints: ICarStintInfo[];
  // carInfo: ICarInfo[];
  // showCars: string[];
  // showAsLabel: string;
}
interface IStintSummary {
  no: number;
  driver: string;
  startStint: string;
  endStint: string;
  laps: number;
  stintTime: string;
  avgLapTime: string;
}
const StintSummary: React.FC<MyProps> = (props: MyProps) => {
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stintSummary);
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;
  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;

  const stintAvg = (si: IStintInfo): string => {
    // exclude in and outlap from calculation
    const laps = currentCarLaps.laps.filter((v) => v.lapNo >= si.lapExit && v.lapNo <= si.lapEnter).slice(1, -1);
    if (laps.length > 0) {
      const avg = laps.reduce((prev, cur) => prev + cur.lapTime, 0) / laps.length;
      return lapTimeString(avg);
    } else {
      return "n.a.";
    }
  };

  const columns: ColumnsType<IStintSummary> = [
    {
      key: "no",
      title: "No",
      align: "right",
      dataIndex: "no",
    },
    {
      key: "name",
      title: "Driver",
      dataIndex: "driver",
    },
    {
      key: "startStint",
      title: "Start",
      align: "right",
      dataIndex: "startStint",
    },
    {
      key: "endStint",
      title: "End",
      align: "right",
      dataIndex: "endStint",
    },
    {
      key: "laps",
      title: "Laps",
      align: "right",
      dataIndex: "laps",
    },
    {
      key: "totalTime",
      title: "Dur",
      align: "right",
      dataIndex: "stintTime",
    },
    {
      key: "avgLapTime",
      title: "Avg",
      align: "right",
      dataIndex: "avgLapTime",
    },
  ];
  const data: IStintSummary[] = getCarStints(carStints, props.carNum).map((v, idx) => ({
    no: idx + 1,
    driver: findDriverByStint(currentCarInfo, v)?.driverName ?? "n.a.",
    startStint: secAsHHMMSS(v.exitTime),
    endStint: secAsHHMMSS(v.enterTime),
    laps: v.numLaps,
    stintTime: secAsHHMMSS(v.stintTime),
    avgLapTime: stintAvg(v),
  }));
  return (
    <Table
      className="iracelog-stint-summary"
      dataSource={data}
      columns={columns}
      pagination={false}
      rowKey={(d: any) => d.no}
    />
  );
};

export default StintSummary;
