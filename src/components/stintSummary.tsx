import { Lap } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_laps_pb";
import { StintInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";
import { Empty, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { useAppSelector } from "../stores";
import { lapTimeString, secAsHHMMSS } from "../utils/output";
import { findDriverByStint, getCarStints, hocDisplayTimeByUserSettings } from "./live/util";

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
  const carInfo = useAppSelector((state) => state.carOccupancies);
  const carStints = useAppSelector((state) => state.carStints);
  const carLaps = useAppSelector((state) => state.carLaps);
  const sessionData = useAppSelector((state) => state.session);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);

  const carStint = carStints.find((v) => v.carNum === props.carNum);
  if (!props.carNum || !carStint) {
    return <Empty />;
  }
  const currentCarInfo = carInfo.find((v) => v.carNum === props.carNum)!;
  const currentCarLaps = carLaps.find((v) => v.carNum === props.carNum)!;

  const stintAvg = (si: StintInfo): string => {
    // exclude in and outlap from calculation
    const laps = (currentCarLaps?.laps ?? ([] as Lap[]))
      .filter((v) => v.lapNo >= si.lapExit && v.lapNo <= si.lapEnter)
      .slice(1, -1);

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
  const displayTimeFromSettings = hocDisplayTimeByUserSettings(
    sessionData,
    stateGlobalSettings.timeMode,
  );
  const data: IStintSummary[] = getCarStints(carStints, props.carNum).map((v, idx) => ({
    no: idx + 1,
    driver: findDriverByStint(currentCarInfo, v)?.name ?? "n.a.",
    startStint: displayTimeFromSettings(v.exitTime),
    endStint: displayTimeFromSettings(v.enterTime),
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
