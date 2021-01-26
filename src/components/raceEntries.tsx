import { DotChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, Spin, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ApplicationState } from "../stores";
import { ensureEventData } from "../stores/raceevents/actions";
import { IRaceEvent } from "../stores/raceevents/types";
import { extractRaceUUID } from "../utils/common";
import RaceEntriesList from "./raceEntriesList";

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
  if (!raceContainer.loaded) {
    return <Spin />;
  }

  const onInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Info for " + e.currentTarget.value);
  };

  const extraButtons = (d: number) => (
    <div>
      <Tooltip title="Stints">
        <Button icon={<InfoCircleOutlined />} value={d} onClick={onInfo} />
      </Tooltip>
      <Tooltip title="Chart">
        <Button icon={<DotChartOutlined />} value={d} onClick={onInfo} />
      </Tooltip>
    </div>
  );

  return <RaceEntriesList raceContainer={raceContainer} extraButtons={extraButtons} />;
};
export default RaceEntries;
