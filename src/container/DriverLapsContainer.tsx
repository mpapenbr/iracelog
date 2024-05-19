import { Col, InputNumber, Row } from "antd";
import * as React from "react";
import { globalWamp } from "../commons/globals";
import Lapchart from "../components/antcharts/lapchart";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateDriverLaps, updateGlobalSettings } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

export const DriverLapsContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.driverLaps);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: IMultiCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateDriverLaps(curSettings));
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
      dispatch(updateDriverLaps(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const onLimitLastLapsChange = (value: any) => {
    const curSettings = { ...userSettings, limitLastLaps: value };
    dispatch(updateDriverLaps(curSettings));
  };

  const onFilterRangeChange = (value: any) => {
    const curSettings = { ...userSettings, filterSecs: value };
    dispatch(updateDriverLaps(curSettings));
  };
  // const oldProps = {
  //   availableCars: selectableCars,
  //   availableClasses: carClasses.map((v) => v.name),
  //   selectedCars: showCars,
  //   selectedCarClasses: filterCarClasses,
  //   onSelectCarFilter: (selection: string[]) => {
  //     const curSettings = { ...userSettings, showCars: selection };
  //     dispatch(driverLapsSettings(curSettings));
  //   },
  //   onSelectCarClassFilter: onSelectCarClassChange,
  // };

  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
        <Col span={6}>
          <InputNumber
            // defaultValue={userSettings.filterSecs}
            value={userSettings.filterSecs}
            precision={0}
            step={2}
            min={0}
            style={{ width: "14ch" }}
            addonAfter={"sec"}
            // formatter={(v) => sprintf("%d sec", v)}
            // parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterRangeChange}
          />
          {globalWamp.currentLiveId ? (
            <InputNumber
              // defaultValue={userSettings.limitLastLaps}
              value={userSettings.limitLastLaps}
              precision={0}
              step={5}
              min={0}
              style={{ width: "14ch" }}
              addonAfter={"laps"}
              // formatter={(v) => sprintf("%d laps", v)}
              // parser={(v) => (v !== undefined ? parseInt(v.replace("laps", "")) : 0)}
              onChange={onLimitLastLapsChange}
            />
          ) : (
            <></>
          )}
        </Col>
      </Row>

      <div style={{ height: 600 }}>
        <Lapchart
          showCars={[...props.selectedCars]}
          limitLastLaps={userSettings.limitLastLaps}
          filterSecs={userSettings.filterSecs}
        />
      </div>
    </>
  );
};
