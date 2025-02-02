import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import * as React from "react";

import { sprintf } from "sprintf-js";

import { useAppSelector } from "../../stores";
import { lapTimeString, secAsHHMMSS } from "../../utils/output";

export const SpeedInfo: React.FC = () => {
  const payload = useAppSelector((state) => state.speedmap);
  const carClasses = useAppSelector((state) => state.carClasses);
  const trackInfo = useAppSelector((state) => state.eventInfo.track);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map<string, string>());

  const data = Object.entries(payload.data)
    // .sort((a, b) => carClassLookup.get(a[0])!.localeCompare(carClassLookup.get(b[0])!))
    .sort((a, b) => a[1].laptime - b[1].laptime)
    .map((cur) => {
      var xKey = "";
      switch (globalSettings.timeMode) {
        case "session":
          xKey = secAsHHMMSS(payload.sessionTime);
          break;
        case "sim":
        case "real": // don't have real time data, so we use sim time instead
          xKey = secAsHHMMSS(payload.timeOfDay);
          break;
      }
      return {
        carClass: carClassLookup.get(cur[0]) ?? "CarClass " + cur[0],
        avgSpeed: (trackInfo.length / cur[1].laptime) * 3.6,
        avgLaptime: cur[1].laptime,
        lastRead: xKey,
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
      render: (d) => d.lastRead,
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
