import { Checkbox, Col, Row } from "antd";
import * as React from "react";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import RacePositionGraphNivo from "../components/nivo/racePositionGraph";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateRacePositions } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

export const RacePositionsContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.racePositions);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
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
      dispatch(updateRacePositions(curSettings));
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
      dispatch(updateRacePositions(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const onCheckboxChange = () => {
    dispatch(
      updateRacePositions({ ...userSettings, showPosInClass: !userSettings.showPosInClass }),
    );
  };
  // const props = {
  //   availableCars: selectableCars,
  //   availableClasses: carClasses.map((v) => v.name),
  //   selectedCars: showCars,
  //   selectedCarClasses: filterCarClasses,
  //   onSelectCarFilter: (selection: string[]) => {
  //     const curSettings = { ...userSettings, showCars: selection };
  //     dispatch(racePositionsSettings(curSettings));
  //   },
  //   onSelectCarClassFilter: onSelectCarClassChange,
  // };

  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
        <Col span={3}>
          <Checkbox
            defaultChecked={userSettings.showPosInClass}
            checked={userSettings.showPosInClass}
            onChange={onCheckboxChange}
          >
            Show position in class
          </Checkbox>
        </Col>
      </Row>

      <RacePositionGraphNivo
        showCars={props.selectedCars}
        showPosInClass={userSettings.showPosInClass}
      />
    </>
  );
};
