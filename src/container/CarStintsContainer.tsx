import { Col, Radio, RadioChangeEvent, Row } from "antd";
import * as React from "react";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { hocDisplayTimeByUserSettings } from "../components/live/util";
import CarStintsNivo from "../components/nivo/carStints";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateStints } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

export const CarStintsContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.stints);
  const carStints = useAppSelector((state) => state.carStints);
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const sessionData = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,
    autoFillCars: true,
    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: IMultiCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateStints(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(
          updateGlobalSettings({
            ...stateGlobalSettings,
            showCars: arg.showCars,
            filterCarClasses: arg.filterCarClasses,
          }),
        );
      }
    },
  };
  const filterProps = prepareFilterData(inputData);
  const props = {
    ...filterProps,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(updateStints(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };
  const displayTimeFromSettings = hocDisplayTimeByUserSettings(
    sessionData,
    stateGlobalSettings.timeMode,
  );
  const graphProps = {
    showCars: filterProps.selectedCars,
    carStints: carStints,
    carOccs: carOccs,
    showAsLabel: userSettings.showAsLabel,
    rangeTimeFormatter: displayTimeFromSettings,
  };
  const onShowModeChange = (e: RadioChangeEvent) => {
    dispatch(updateStints({ ...userSettings, showAsLabel: e.target.value }));
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
        <MultiSelectCarFilter {...props} />
        {ShowMode}
      </Row>

      <CarStintsNivo {...graphProps} />
    </>
  );
};
