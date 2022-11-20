import { Col, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LaptimeEvolution } from "../components/speedmap/laptimeEvolution";
import { SpeedInfo } from "../components/speedmap/speedinfo";
import { Speedmap } from "../components/speedmap/speedmap";
import { ApplicationState } from "../stores";
import { globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const SpeedmapContainer: React.FC = () => {
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
        <Col>
          <h3>Speed (km/h) over track position</h3>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Speedmap />
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          <SpeedInfo />
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Laptime over session time</h3>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <LaptimeEvolution />
        </Col>
      </Row>
    </>
  );
};
