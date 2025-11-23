import { Checkbox, Col, Radio, RadioChangeEvent, Row, Select, Space } from "antd";
import * as React from "react";
import { useAppDispatch, useAppSelector } from "../stores";
import {
  setTheme,
  setTimeMode,
  toggleCompact,
  toggleFilterOrderByPosition,
  toggleInOutTimes,
  toggleSyncSelection,
} from "../stores/grpc/slices/userSettingsSlice";

const { Option } = Select;

export const GlobalSettings: React.FC = () => {
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  // console.log(selectableCars);
  const dispatch = useAppDispatch();

  const onGlobalSynchChange = () => {
    dispatch(toggleSyncSelection());
  };
  const onGlobalFilterOrdering = () => {
    dispatch(toggleFilterOrderByPosition());
  };
  const onGlobalCompactModeChanged = () => {
    dispatch(toggleCompact());
  };
  const onGlobalInOutLaptimeChanged = () => {
    dispatch(toggleInOutTimes());
  };
  const onGlobalThemeSelect = (e: RadioChangeEvent) => {
    dispatch(setTheme(e.target.value));
  };
  const onGlobalTimeMode = (e: RadioChangeEvent) => {
    dispatch(setTimeMode(e.target.value));
  };
  // Stop event propagation to prevent popover from closing
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <div onClick={handleClick}>
      <Row>
        <Col span={24}>
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <Checkbox checked={stateGlobalSettings.syncSelection} onChange={onGlobalSynchChange}>
              Synchronize selections
            </Checkbox>

            <Checkbox
              checked={stateGlobalSettings.filterOrderByPosition}
              onChange={onGlobalFilterOrdering}
            >
              Order cars in filter by race position
            </Checkbox>

            <Radio.Group defaultValue={stateGlobalSettings.timeMode} onChange={onGlobalTimeMode}>
              <Radio.Button value="session">Session time</Radio.Button>
              <Radio.Button value="sim">Simualtion time</Radio.Button>
              <Radio.Button value="real">Real time</Radio.Button>
            </Radio.Group>

            <Radio.Group defaultValue={stateGlobalSettings.theme} onChange={onGlobalThemeSelect}>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dimmed">Dimmed</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
            </Radio.Group>

            <Checkbox
              checked={stateGlobalSettings.useCompact}
              onChange={onGlobalCompactModeChanged}
            >
              Use compact mode
            </Checkbox>

            <Checkbox
              checked={stateGlobalSettings.useInOutTimes}
              onChange={onGlobalInOutLaptimeChanged}
            >
              Use in/out laptimes
            </Checkbox>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
