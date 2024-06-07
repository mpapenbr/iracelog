import { Card, Checkbox, Col, Radio, RadioChangeEvent, Row, Select } from "antd";
import * as React from "react";
import { useAppDispatch, useAppSelector } from "../stores";
import {
  setTheme,
  toggleCompact,
  toggleFilterOrderByPosition,
  toggleSyncSelection,
} from "../stores/grpc/slices/userSettingsSlice";

const { Option } = Select;

export const SettingsContainer: React.FC = () => {
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
  const onGlobalThemeSelect = (e: RadioChangeEvent) => {
    dispatch(setTheme(e.target.value));
  };
  return (
    <>
      <Row>
        <Col span={10}>
          <Card title="Global settings">
            <p>
              <Checkbox checked={stateGlobalSettings.syncSelection} onChange={onGlobalSynchChange}>
                Synchronize selections
              </Checkbox>
            </p>
            <p>
              <Checkbox
                checked={stateGlobalSettings.filterOrderByPosition}
                onChange={onGlobalFilterOrdering}
              >
                Order cars in filter by race position
              </Checkbox>
            </p>
            <p>
              <Radio.Group defaultValue={stateGlobalSettings.theme} onChange={onGlobalThemeSelect}>
                <Radio.Button value="light">Light</Radio.Button>
                <Radio.Button value="dimmed">Dimmed</Radio.Button>
                <Radio.Button value="dark">Dark</Radio.Button>
              </Radio.Group>
            </p>
            <p>
              <Checkbox
                checked={stateGlobalSettings.useCompact}
                onChange={onGlobalCompactModeChanged}
              >
                Use compact mode
              </Checkbox>
            </p>
          </Card>
        </Col>
      </Row>
    </>
  );
};
