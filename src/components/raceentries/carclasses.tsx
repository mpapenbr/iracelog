import { Card, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import * as React from "react";
import { useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../../stores";
import { ICarClass, IEntry } from "../../stores/cars/types";

export const CarClasses: React.FC = () => {
  const carClasses: ICarClass[] = useSelector(
    (state: ApplicationState) => state.carData.carClasses,
  );

  const entries: IEntry[] = useSelector((state: ApplicationState) => state.carData.entries);

  const numEntriesLookup = _.countBy(entries, "car.carClassId");

  const idxToId = _.map(entries, (item) => ({
    idx: item.car.carIdx,
    carClassId: item.car.carClassId,
  }));
  const m = Object.assign({}, ...idxToId.map((x) => ({ [x.idx]: x.carClassId })));
  // console.log(m);

  const x = _.flatMap(entries, "drivers");
  // console.log(x);
  // const y = x.map((item) => ({ carId: m[item.carIdx], iRating: item.iRating }));

  const y1 = x.map((item) => ({ carClassId: m[item.carIdx], iRating: item.iRating }));
  const y2 = _.groupBy(y1, "carClassId");

  const avgiRatingLookup = new Map();
  _.forEach(y2, (v, k) => {
    avgiRatingLookup.set(k, _.meanBy(v, "iRating"));
  });

  // eslint-disable-next-line @typescript-eslint/ban-types
  const columns: ColumnsType<{}> = [
    { key: "carclass_name", title: "Car", render: (d) => d.name, align: "left" },
    {
      key: "carclass_entries",
      title: "Num",
      render: (d) => numEntriesLookup[d.id],
      width: 10,
      align: "right",
    },
    {
      key: "carclass_sof",
      title: "SOF",
      render: (d) => sprintf("%.0f", avgiRatingLookup.get(d.id.toString()) ?? 0),
      width: 10,
      align: "right",
    },
  ];

  return (
    <Card title="Car classes">
      <Table
        className="iracelog-compact"
        columns={columns}
        dataSource={carClasses}
        pagination={false}
      />
    </Card>
  );
};
