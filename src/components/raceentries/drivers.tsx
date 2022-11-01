import { Card, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import * as React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../../stores";
import { ICarClass, ICarInfo, IDriverEntry, IEntry } from "../../stores/cars/types";
import { sortCarNumberStr } from "../../utils/output";

export const Drivers: React.FC = () => {
  const carClasses: ICarClass[] = useSelector(
    (state: ApplicationState) => state.carData.carClasses,
  );
  const cars: ICarInfo[] = useSelector((state: ApplicationState) => state.carData.cars);
  const entries: IEntry[] = useSelector((state: ApplicationState) => state.carData.entries);

  const carClassLookup = Object.assign({}, ...carClasses.map((x) => ({ [x.id]: x })));
  const entryByIdx = Object.assign({}, ...entries.map((x) => ({ [x.car.carIdx]: x })));

  const allDrivers = _.flatMap(entries, "drivers");

  interface IDriverData extends IDriverEntry {
    entry: IEntry;
    carClassName: string;
  }
  const extDriverData: IDriverData[] = allDrivers.map((d) => ({
    ...d,
    entry: entryByIdx[d.carIdx],
    carClassName: carClassLookup[entryByIdx[d.carIdx].car.carClassId].name,
  }));

  const columns: ColumnsType<IDriverData> = [
    {
      key: "carno",
      title: "#",
      render: (d) => d.entry.car.carNumber,
      width: 50,
      align: "right",
      // sorter: (a, b) => a.entry.car.carNumberRaw - b.entry.car.carNumberRaw,
      sorter: (a, b) => sortCarNumberStr(a.entry.car.carNumber, b.entry.car.carNumber),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
    {
      key: "drivers_name",
      title: "Name",
      render: (d) => d.name,
      // width: "20%",
      align: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
    {
      key: "teamName",
      title: "Team",
      render: (d) => d.entry.team.name,
      // width: "20%",
      align: "left",
      sorter: (a, b) => a.entry.team.name.localeCompare(b.entry.team.name),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
      filterSearch: true,
      filters: entries
        .map((c) => ({ text: c.team.name, value: c.team.name }))
        .sort((a, b) => a.text.localeCompare(b.text)),

      onFilter: (value, record) => record.entry.team.name.startsWith(value as string),
    },
    {
      key: "driver_carClass",
      title: "Car class",
      render: (d) => d.carClassName,
      // width: "12%",
      align: "left",
      sorter: (a, b) => a.carClassName.localeCompare(b.carClassName),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
      filters: carClasses
        .map((c) => ({ text: c.name, value: c.name }))
        .sort((a, b) => a.text.localeCompare(b.text)),
      onFilter: (value, record) => record.carClassName === value,
    },
    {
      key: "driver_carName",
      title: "Car",
      render: (d) => d.entry.car.name,
      // width: "15%",
      align: "left",
      sorter: (a, b) => a.entry.car.name.localeCompare(b.entry.car.name),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
      filters: cars
        .map((c) => ({ text: c.nameShort, value: c.nameShort }))
        .sort((a, b) => a.text.localeCompare(b.text)),
      onFilter: (value, record) => record.entry.car.name === value,
    },

    {
      key: "irating",
      title: "iRating",
      render: (d) => d.iRating,
      width: 50,
      align: "right",
      sorter: (a, b) => a.iRating - b.iRating,
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
    {
      key: "license",
      title: "License",
      render: (d) => d.licString,
      width: 50,
      align: "right",
      sorter: (a, b) => a.licLevel * 1000 + a.licSubLevel - (b.licLevel * 1000 + b.licSubLevel),
      sortDirections: ["ascend", "descend", "ascend"],
      defaultSortOrder: "ascend",
    },
  ];

  return (
    <Card title="Drivers">
      <Table
        className="iracelog-compact"
        columns={columns}
        dataSource={extDriverData}
        pagination={false}
      />
    </Card>
  );
};
