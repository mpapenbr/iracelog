import { DeleteOutlined } from "@ant-design/icons";
import { Button, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import { ApplicationState } from "../stores";
import { deleteRaceEvent } from "../stores/raceevents/actions";
import { IRaceEvent } from "../stores/raceevents/types";
import RaceDetailsFrame from "./raceDetails";

interface IStateProps {
  events: IRaceEvent[];
}
interface IDispatchProps {
  // deleteEvent: (id: string) => any;
}

type MyProps = IStateProps & IDispatchProps;

const RaceEventList: React.FC<{}> = () => {
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const raceEventsData = useSelector((state: ApplicationState) => state.raceEvents.data);

  const columns: ColumnsType<IRaceEvent> = [
    {
      key: "id",
      title: "Id",
      dataIndex: "id",
      render: (d) => <Link to={`${match.url}/details/${d}`}>{d}</Link>,
    },
    { key: "ownerId", title: "ownerId", dataIndex: "ownerId" },
    { key: "trackNameShort", title: "Track", dataIndex: "trackNameShort" },
    {
      key: "lastModified",
      title: "Last change",
      dataIndex: "lastModified",
      sorter: (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
      defaultSortOrder: "descend",
      render: (d: Date) => d.toLocaleString(),
    },
    // {
    //   title: "Action",
    //   dataIndex: "id",
    //   key: "action",

    //   render: (no: number, record: IRaceEvent) => extraButtons(record),
    // },
  ];

  const cbDeleteEvent = useCallback((eventId: string) => dispatch(deleteRaceEvent("authTokenTBD", eventId)), [
    dispatch,
  ]);
  const onClickForRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    // dispatch(deleteRaceEvent(e.currentTarget.value, "authTokenTBD"));
    cbDeleteEvent(e.currentTarget.value);
  };
  const extraButtons = (d: IRaceEvent) => (
    <div>
      <Tooltip title="Delete the event">
        <Button icon={<DeleteOutlined />} value={d.id} onClick={onClickForRemove} />
      </Tooltip>
    </div>
  );
  <Switch>
    <Route path={`${match.url}/details/:id`} component={RaceDetailsFrame} />
  </Switch>;
  return <Table columns={columns} dataSource={raceEventsData} rowKey={(d) => d.id} />;
};
export default RaceEventList;
