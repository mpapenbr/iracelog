import { Col, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Cars } from "../components/raceentries/cars";
import { ApplicationState } from "../stores";
import { globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const RaceEntriesContainer: React.FC = () => {
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.strategy);

  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onGlobalSynchChange = () => {
    dispatch(
      globalSettings({ ...stateGlobalSettings, syncSelection: !stateGlobalSettings.syncSelection }),
    );
  };
  const onGlobalFilterOrdering = () => {
    dispatch(
      globalSettings({
        ...stateGlobalSettings,
        filterOrderByPosition: !stateGlobalSettings.filterOrderByPosition,
      }),
    );
  };
  return (
    <>
      <Row>
        <Col span={24}>
          <Cars />
        </Col>
      </Row>
    </>
  );
};
