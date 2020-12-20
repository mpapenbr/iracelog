import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../stores";
import { IRaceEvent } from "../stores/raceevents/types";

const RaceEventList: React.FC<{}> = () => {
  const raceEventsData = useSelector((state: ApplicationState) => state.raceEvents.data);
  const columns: ColumnsType<IRaceEvent> = [
    { key: "id", title: "Id", dataIndex: "id" },
    { key: "ownerId", title: "ownerId", dataIndex: "ownerId" },
    {
      key: "lastModified",
      title: "Last change",
      dataIndex: "lastModified",
      sorter: (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
      defaultSortOrder: "descend",
      render: (d: Date) => d.toLocaleString(),
    },
  ];
  return <Table columns={columns} dataSource={raceEventsData} rowKey={(d) => d.id} />;
};
export default RaceEventList;
