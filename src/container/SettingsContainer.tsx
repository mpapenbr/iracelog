import { Card, Checkbox, Col, Row, Select } from "antd";
import * as React from "react";
import { useAppDispatch, useAppSelector } from "../stores";
import {
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
          </Card>
        </Col>
      </Row>
    </>
  );
};
