import { Card, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import * as React from "react";

import { sprintf } from "sprintf-js";
import { useAppSelector } from "../../stores";
import { iRacingCarDataLookup } from "../../utils/cardata";

export const Cars: React.FC = () => {
  const entries = useAppSelector((state) => state.carEntries);
  const carInfos = useAppSelector((state) => state.carInfos)
    .slice()
    .sort((a, b) => {
      const byClass = a.carClassName.localeCompare(b.carClassName);
      if (byClass === 0) {
        return a.name.localeCompare(b.name);
      } else return byClass;
    });

  const numEntriesLookup = _.countBy(entries, "car.carId");

  const idxToId = _.map(entries, (item) => ({ idx: item.car!.carIdx, carId: item.car!.carId }));
  const m = Object.assign({}, ...idxToId.map((x) => ({ [x.idx]: x.carId })));
  // console.log(m);

  const x = _.flatMap(entries, "drivers");
  // console.log(x);
  // const y = x.map((item) => ({ carId: m[item.carIdx], iRating: item.iRating }));

  const y1 = x.map((item) => ({ carId: m[item.carIdx], iRating: item.iRating }));
  const y2 = _.groupBy(y1, "carId");

  const avgiRatingLookup = new Map();
  _.forEach(y2, (v, k) => {
    avgiRatingLookup.set(k, _.meanBy(v, "iRating"));
  });

  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<{}> = [
    { key: "cars_name", title: "Car", render: (d) => d.nameShort, align: "left" },
    {
      key: "cars_abbrev",
      title: "Abbrev",
      render: (d) => iRacingCarDataLookup.get(d.carId)?.abbrev ?? "n.a.",
      align: "left",
    },
    {
      key: "cars_carClass",
      title: "Car class",
      render: (d) => d.carClassName,
      // width: "20%",
      align: "left",
    },
    {
      key: "fuelPct",
      title: "Fuel",
      render: (d) => sprintf("%.0f %%", d.fuelPct * 100),
      width: 60,
      align: "right",
    },
    {
      key: "powerAdjust",
      title: "Power",
      render: (d) => sprintf("%.1f %%", 100 + d.powerAdjust),
      width: 60,
      align: "right",
    },
    {
      key: "weight",
      title: "Weight",
      render: (d) => sprintf("%.0f kg", d.weightPenalty),
      width: 50,
      align: "right",
    },
    {
      key: "cars_entries",
      title: "Num",
      render: (d) => numEntriesLookup[d.carId],
      width: 50,
      align: "right",
    },
    {
      key: "cars_sof",
      title: "SOF",
      render: (d) => sprintf("%.0f", avgiRatingLookup.get(d.carId.toString()) ?? 0),
      width: 50,
      align: "right",
    },
  ];

  return (
    <Card title="Cars">
      <Table
        className="iracelog-compact"
        columns={columns}
        dataSource={carInfos}
        pagination={false}
        rowKey={(d: any) => d.carId}
      />
    </Card>
  );
};
