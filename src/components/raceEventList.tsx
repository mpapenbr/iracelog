import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { useSelector } from "react-redux";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import { ApplicationState } from "../stores";
import { IRaceEvent } from "../stores/raceevents/types";
import RaceDetailsFrame from "./raceDetails";

const RaceEventList: React.FC<{}> = () => {
  let match = useRouteMatch();
  const raceEventsData = useSelector((state: ApplicationState) => state.raceEvents.data);
  const columns: ColumnsType<IRaceEvent> = [
    { key: "id", title: "Id", dataIndex: "id", render: (d) => <Link to={`${match.url}/details/${d}`}>{d}</Link> },
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
  <Switch>
    <Route path={`${match.url}/details/:id`} component={RaceDetailsFrame} />
  </Switch>;
  return <Table columns={columns} dataSource={raceEventsData} rowKey={(d) => d.id} />;
};
export default RaceEventList;
