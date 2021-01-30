import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Col, Row, Spin, Tooltip } from "antd";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import RaceEventService from "../api/events";
import { ApplicationState } from "../stores";
import { defaultDriverData, IDriver, IDriverMeta } from "../stores/drivers/types";
import { ensureEventData, loadEventData } from "../stores/raceevents/actions";
import { IStintData } from "../stores/types/stints";
import { uiSetStintNo } from "../stores/ui/actions";
import RaceEntriesList from "./raceEntriesList";
import StintDetails from "./stint/stintDetails";

// some helper
// TODO: move this to a more common location. we need this very often
const closestDriverEntry = (driverData: IDriverMeta[], carIdx: number, sessionTick: number): IDriver => {
  const invSortedByTime = driverData
    .filter((d) => d.data.carIdx === carIdx)
    .filter((d) => d.sessionTick <= sessionTick)
    .sort((a, b) => b.sessionTime - a.sessionTime);
  // console.log(invSortedByTime);
  return invSortedByTime.length > 0 ? invSortedByTime[0].data : defaultDriverData();
};

const Stints: React.FC<{}> = () => {
  const [loadTrigger, setLoadTrigger] = useState(0);
  const location = useLocation();
  const regex = /.*?\/details\/(?<myId>.*?)\/.*$/;
  const { myId } = location.pathname.match(regex)?.groups!;
  const dispatch = useDispatch();

  const [stints, setStints] = useState([] as IStintData[]);
  useEffect(() => {
    console.log("Now trigger load event details for " + myId + " (pitstops)");

    dispatch(ensureEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  }, [loadTrigger]);
  const raceContainer = useSelector((state: ApplicationState) => state.raceEvents.current);
  if (!raceContainer.loaded) {
    return <Spin />;
  }

  const onReloadRequested = () => {
    dispatch(loadEventData("TBD_TOKEN_FOR_ENSURE_DATA", myId));
  };

  let tmpMarkCarIdx: number[] = [];

  // use this in the future.
  // const raceSession = _.last(raceContainer.eventData.sessions)?.num;

  const raceSession = _.last(raceContainer.summary.sessionSummaries)?.sessionNum!;

  const onLoadStints = (e: React.MouseEvent<HTMLButtonElement>) => {
    // dispatch(deleteRaceEvent(e.currentTarget.value, "authTokenTBD"));
    console.log("shouldLoad stints for " + e.currentTarget.value);
    dispatch(uiSetStintNo(0));
    const carIdx = parseInt(e.currentTarget.value);
    RaceEventService.stints("TBD_TOKEN_PITSTOPS", myId, raceSession, carIdx).then((v) => {
      setStints(v);
    });
  };

  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Stints">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onLoadStints} />
      </Tooltip>
    </div>
  );

  return (
    <Row gutter={16}>
      <Col span={8}>
        <RaceEntriesList
          raceContainer={raceContainer}
          autoDetect={true}
          showColums={["carNo", "driverName", "teamName", "carClass", "action"]}
          extraButtons={extraButtons}
          tableProps={{ title: () => <Button icon={<ReloadOutlined />} onClick={onReloadRequested} /> }}
        />
      </Col>
      {stints !== undefined && stints.length > 0 ? (
        <Col span={16}>
          <StintDetails stints={stints} raceContainer={raceContainer} />
        </Col>
      ) : (
        <div />
      )}
    </Row>
  );
};

export default Stints;
