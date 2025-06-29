import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { RaceloggerService } from "@buf/mpapenbr_iracelog.bufbuild_es/racelogger/v1/racelogger_service_pb";
import { Descriptions } from "antd";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../stores";
import {
  resetSettings,
  updateBackendAvailable,
  updateBackendCompatible,
  updateCurrentSessionNum,
  updateRaceloggerServerAvailable,
  updateRaceSessions,
  updateRecording,
  updateSimulationRunning,
  updateTelemetryAvailable,
} from "../../stores/grpc/slices/raceloggerStatusSlice";
import { useClient } from "../../utils/useLocalClient";

export const RaceloggerStatusLoader: React.FC = () => {
  const rlSettings = useAppSelector((state) => state.raceloggerSettings);
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);
  const client = useClient(rlSettings.url, RaceloggerService);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const dispatch = useAppDispatch();
  useEffect(() => {
    client.getStatusStream(
      {},
      (res) => {
        dispatch(updateRaceloggerServerAvailable(true));
        if (res) {
          // console.log("Racelogger status (stream):", res);
          dispatch(updateBackendAvailable(res.backendAvailable));
          dispatch(updateBackendCompatible(res.backendCompatible));
          dispatch(updateSimulationRunning(res.simulationRunning));
          dispatch(updateTelemetryAvailable(res.telemetryAvailable));
          dispatch(updateCurrentSessionNum(res.currentSessionNum));
          dispatch(updateRecording(res.recordingActive));
          dispatch(updateRaceSessions(res.raceSessions));
        }
      },
      (err) => {
        console.error("Error fetching racelogger status stream:", err);
        dispatch(resetSettings());
      },
    );
  }, [loadTrigger]);
  return <></>;
};

const statusIcon = (b: boolean) =>
  b ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="red" />;

export const RaceloggerStatus: React.FC = () => {
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);

  return (
    <Descriptions title="Racelogger status" bordered column={1}>
      <Descriptions.Item
        label="Racelogger available"
        children={statusIcon(rlStatus.raceloggerServerAvailable)}
      />
      <Descriptions.Item label="Recording" children={statusIcon(rlStatus.recording)} />
    </Descriptions>
  );
};

export const RaceloggerBackendStatus: React.FC = () => {
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);

  return (
    <Descriptions title="Racelogger backend status" bordered column={1}>
      <Descriptions.Item
        label="Backend Available"
        children={statusIcon(rlStatus.backendAvailable)}
      />

      <Descriptions.Item
        label="Backend Compatible"
        children={statusIcon(rlStatus.backendCompatible)}
      />
    </Descriptions>
  );
};
export const IRacingStatus: React.FC = () => {
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);
  return (
    <Descriptions title="iRacing status" bordered column={1}>
      <Descriptions.Item
        label="Simulation Running"
        children={statusIcon(rlStatus.simulationRunning)}
      />
      <Descriptions.Item
        label="Sim Data Available"
        children={statusIcon(rlStatus.telemetryAvailable)}
      />
    </Descriptions>
  );
};

export const RaceloggerRecorderStatus: React.FC = () => {
  const rlStatus = useAppSelector((state) => state.raceloggerStatus);

  return (
    <Descriptions title="Racelogger recorder status" bordered column={1}>
      <Descriptions.Item label="Recording" children={statusIcon(rlStatus.recording)} />
    </Descriptions>
  );
};
