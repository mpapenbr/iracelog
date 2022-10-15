import { Col, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CarClasses } from "../components/raceentries/carclasses";
import { Cars } from "../components/raceentries/cars";
import { Drivers } from "../components/raceentries/drivers";
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
        <Col span={17}>
          <Cars />
        </Col>
        <Col span={7}>
          <CarClasses />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Drivers />
        </Col>
      </Row>
    </>
  );
};
