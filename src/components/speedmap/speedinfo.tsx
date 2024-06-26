import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import * as React from "react";

import { sprintf } from "sprintf-js";

import { useAppSelector } from "../../stores";
import { lapTimeString, secAsString } from "../../utils/output";

export const SpeedInfo: React.FC = () => {
  const payload = useAppSelector((state) => state.speedmap);
  const carClasses = useAppSelector((state) => state.carClasses);
  const trackInfo = useAppSelector((state) => state.eventInfo.track);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map());

  const data = Object.entries(payload.data).map((cur) => {
    return {
      carClass: carClassLookup.get(cur[0]) ?? "CarClass " + cur[0],
      avgSpeed: (trackInfo.length / cur[1].laptime) * 3.6,
      avgLaptime: cur[1].laptime,
      lastRead: payload.timeOfDay,
    };
  });
  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<{}> = [
    { key: "carClass", title: "CarClass", render: (d) => d.carClass, width: 20, align: "left" },
    {
      key: "avgLaptime",
      title: "Avg Lap",
      render: (d) => lapTimeString(d.avgLaptime),
      width: 20,
      align: "right",
    },
    {
      key: "avgSpeed",
      title: "Speed",
      render: (d) => sprintf("%.0f km/h", d.avgSpeed),
      width: 20,
      align: "right",
    },
    {
      key: "lastRead",
      title: "Last update",
      render: (d) => secAsString(d.lastRead),
      width: 20,
      align: "right",
    },
  ];
  return (
    <Table
      className="iracelog-compact"
      dataSource={data}
      columns={columns}
      pagination={false}
      rowKey={(d: any) => d.carClass}
    />
  );
};
