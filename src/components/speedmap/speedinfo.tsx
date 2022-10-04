import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import * as React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { ICarClass } from "../../stores/cars/types";
import { ISpeedmapData } from "../../stores/speedmap/types";
import { lapTimeString } from "../../utils/output";

export const SpeedInfo: React.FC = () => {
  const payload: ISpeedmapData = useSelector(
    (state: ApplicationState) => state.speedmap.speedmapData,
  );
  const carClasses: ICarClass[] = useSelector(
    (state: ApplicationState) => state.carData.carClasses,
  );

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map());

  const data = Object.entries(payload.data).map((cur) => {
    const avgLaptime = cur[1].reduce((prev, cur) => prev + payload.chunkSize / (cur / 3.6), 0);
    return {
      carClass: carClassLookup.get(cur[0]) ?? "CarClass " + cur[0],
      avgSpeed: (payload.trackLength / avgLaptime) * 3.6,
      avgLaptime,
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
  ];
  return <Table dataSource={data} columns={columns} pagination={false} />;
};
