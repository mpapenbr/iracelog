import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Row, Space, Spin, Statistic, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { sprintf } from "sprintf-js";
import { ApplicationState } from "../stores";
import { IDriverMeta } from "../stores/drivers/types";
import { ensureEventData } from "../stores/raceevents/actions";
import { IRaceContainer, IRaceEvent } from "../stores/raceevents/types";
import { uiShowEntryDetails } from "../stores/ui/actions";
import { adjustRawNumber } from "../utils/output";
import RaceEntriesList from "./raceEntriesList";
import {
  carNames,
  collectCarClassesIratingAvg,
  driverNames,
  extractRaceUUID,
  iRatingAvg,
  teamDriverData,
  teamNames,
} from "./util/common";

interface IStateProps {
  events: IRaceEvent[];
}
interface IDispatchProps {
  // deleteEvent: (id: string) => any;
}

type MyProps = IStateProps & IDispatchProps;

const RaceEntries: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const myId = extractRaceUUID(location.pathname);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Now trigger load event details for " + myId);

    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  }, [loadTrigger]);
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  const showEntryDetails = useSelector((state: ApplicationState) => state.ui.data.entries.entryDetails);
  if (!raceContainer.loaded) {
    return <Spin />;
  }

  const onInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Info for " + e.currentTarget.value);
    dispatch(uiShowEntryDetails(parseInt(e.currentTarget.value)));
  };

  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Stints">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onInfo} />
      </Tooltip>
      {/* <Tooltip title="Chart">
        <Button icon={<DotChartOutlined />} value={d} onClick={onInfo} />
      </Tooltip> */}
    </div>
  );

  return (
    <>
      <Row>
        <Space size={12}>
          <Statistic title="Date" value={raceContainer.eventData.lastModified.toLocaleDateString()} />
          <Statistic title="Track" value={raceContainer.eventData.trackNameLong} />
          <Statistic title="Length" value={raceContainer.eventData.trackLength} />
          {raceContainer.eventData.numCarClasses > 0 ? (
            <Statistic title="Classes" value={raceContainer.eventData.numCarClasses} />
          ) : (
            <div />
          )}

          <Statistic title="Cars" value={carNames(raceContainer).length} />

          {raceContainer.eventData.teamRacing > 0 ? (
            <Statistic title="Teams" value={teamNames(raceContainer).length} />
          ) : (
            <div />
          )}
          <Statistic title="Drivers" value={driverNames(raceContainer).length} />
          <Statistic title="Ø iRating" precision={0} value={iRatingAvg(raceContainer)} />
          {raceContainer.eventData.numCarClasses > 0 ? (
            collectCarClassesIratingAvg(raceContainer).map((d) => (
              <Statistic title={d.name} precision={0} value={d.avg} />
            ))
          ) : (
            <div />
          )}
        </Space>
      </Row>
      <Row gutter={4}>
        <Col span={12}>
          <RaceEntriesList raceContainer={raceContainer} extraButtons={extraButtons} />;
        </Col>
        <Col span={12}>
          {showEntryDetails > -1 ? <TeamDetails raceContainer={raceContainer} idx={showEntryDetails} /> : <Empty />}
        </Col>
      </Row>
    </>
  );
};

interface ITeamDetailsProps {
  raceContainer: IRaceContainer;
  idx: number;
}
const TeamDetails: React.FC<ITeamDetailsProps> = (props: ITeamDetailsProps) => {
  const drivers = teamDriverData(props.idx, props.raceContainer);
  const columns: ColumnsType<IDriverMeta> = [
    {
      key: "driverName",
      title: "Driver",
      render: (d) => d.data.userName,
      sorter: (a, b) => a.data.userName.localeCompare(b.data.userName),
    },
    {
      key: "iRating",
      title: "iRating",
      render: (d) => d.data.iRating,
      sorter: (a, b) => a.data.iRating - b.data.iRating,
    },
  ];
  // const teamName = () =>
  //   sprintf("%s, Ø iRating %d", drivers[0].data.teamName, _.mean(drivers.map((d) => d.data.iRating)));
  const teamName = () => (
    <Row justify="space-between">
      <Col span="10">
        <h3>
          #{adjustRawNumber(drivers[0].data.carNumberRaw)} {drivers[0].data.teamName}
        </h3>
      </Col>
      <Col>{sprintf("Ø iRating %d", _.mean(drivers.map((d) => d.data.iRating)))}</Col>
    </Row>
  );
  return (
    <Table title={teamName} dataSource={drivers} columns={columns} pagination={false} rowKey={(d) => _.uniqueId()} />
  );
};

export default RaceEntries;
