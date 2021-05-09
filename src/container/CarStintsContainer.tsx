import { Col, Radio, RadioChangeEvent, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import { processCarClassSelectionNew } from "../components/live/util";
import CarStintsNivo from "../components/nivo/carStints";
import { ApplicationState } from "../stores";
import { stintsSettings } from "../stores/ui/actions";

export const CarStintsContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stints);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.stints.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.stints.filterCarClasses);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: userSettings.filterCarClasses,
      currentShowCars: userSettings.showCars,
      newSelection: values,
    });
    const curSettings = { ...userSettings, filterCarClasses: values, showCars: newShowcars };
    dispatch(stintsSettings(curSettings));
  };

  const props = {
    availableCars: cars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(stintsSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  const onShowModeChange = (e: RadioChangeEvent) => {
    dispatch(stintsSettings({ ...userSettings, showAsLabel: e.target.value }));
  };
  const ShowMode = (
    <Col>
      <Radio.Group onChange={onShowModeChange} value={userSettings.showAsLabel}>
        <Radio.Button value="duration">Duration</Radio.Button>
        <Radio.Button value="laps">Laps</Radio.Button>
      </Radio.Group>
    </Col>
  );
  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
        {ShowMode}
      </Row>

      <CarStintsNivo />
    </>
  );
};
