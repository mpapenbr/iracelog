import { Card, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import * as React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { ICarClass, ICarInfo, IEntry } from "../../stores/cars/types";

export const Cars: React.FC = () => {
  const carClasses: ICarClass[] = useSelector(
    (state: ApplicationState) => state.carData.carClasses,
  );
  const cars: ICarInfo[] = useSelector((state: ApplicationState) => state.carData.cars);
  const entries: IEntry[] = useSelector((state: ApplicationState) => state.carData.entries);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map());
  const numEntriesLookup = _.countBy(entries, "car.carId");

  const idxToId = _.map(entries, (item) => ({ idx: item.car.carIdx, carId: item.car.carId }));
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
    { key: "name", title: "Car", render: (d) => d.nameShort, align: "left" },
    {
      key: "carClass",
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
      key: "entries",
      title: "Num",
      render: (d) => numEntriesLookup[d.carId],
      width: 50,
      align: "right",
    },
    {
      key: "irating",
      title: "SOF",
      render: (d) => sprintf("%.0f", avgiRatingLookup.get(d.carId.toString()) ?? 0),
      width: 50,
      align: "right",
    },
  ];

  return (
    <Card title="Cars">
      <Table className="iracelog-compact" columns={columns} dataSource={cars} pagination={false} />
    </Card>
  );
};
