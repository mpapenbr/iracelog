import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Popover, Row } from "antd";
import * as React from "react";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import CarPitstopsNivo from "../components/nivo/carPitstops";
import PitstopControl from "../components/pitstopControl";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updatePits } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

export const CarPitstopsContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.pits);
  const carPits = useAppSelector((state) => state.carPits);

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
      dispatch(updatePits(curSettings));
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
      dispatch(updatePits(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const graphProps = {
    showCars: filterProps.selectedCars,
    carPits: carPits,
    hideLongPitstops: userSettings.hideLongPitstops,
    hideThreshold: userSettings.hideThreshold,
  };
  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />

        <Popover content={<PitstopControl />} title="Configure settings">
          <Button icon={<SettingOutlined />} />
        </Popover>
        <Col offset={7} span={1}></Col>
      </Row>

      <CarPitstopsNivo {...graphProps} />
    </>
  );
};
