import { Card, Checkbox, Col, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "../stores";
import { globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const SettingsContainer: React.FC = () => {
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.strategy);

  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onGlobalSynchChange = () => {
    dispatch(globalSettings({ ...stateGlobalSettings, syncSelection: !stateGlobalSettings.syncSelection }));
  };
  const onGlobalFilterOrdering = () => {
    dispatch(
      globalSettings({ ...stateGlobalSettings, filterOrderByPosition: !stateGlobalSettings.filterOrderByPosition })
    );
  };
  return (
    <>
      <Row>
        <Col span={6}>
          <Card title="Global settings">
            <p>
              <Checkbox checked={stateGlobalSettings.syncSelection} onChange={onGlobalSynchChange}>
                Synchronize selections
              </Checkbox>
            </p>
            <p>
              <Checkbox checked={stateGlobalSettings.filterOrderByPosition} onChange={onGlobalFilterOrdering}>
                Order cars in filter by position
              </Checkbox>
            </p>
          </Card>
        </Col>
      </Row>
    </>
  );
};
