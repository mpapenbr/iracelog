import { Col, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { globalWamp } from "../commons/globals";
import Delta from "../components/antcharts/deltagraph";
import ReferenceCarFilter from "../components/live/referenceCarSelectFilter";
import { useAppDispatch, useAppSelector } from "../stores";
import { IReferenceCarSelectFilterSettings } from "../stores/grpc/slices/types";
import {
  updateGlobalSettings,
  updateRaceGraphRelative,
} from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./referenceCarSelectFilterHelper";

const { Option } = Select;

export const RaceGraphByReferenceContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.raceGraphRelative);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    autoFillCars: true,

    selectedCallback: (arg: IReferenceCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateRaceGraphRelative(curSettings));
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
      dispatch(updateRaceGraphRelative(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectReferenceCar: (selection: string) => {
      const curSettings = { ...userSettings, referenceCarNum: selection };
      dispatch(updateRaceGraphRelative(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, referenceCarNum: selection }));
      }
    },
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(updateRaceGraphRelative(curSettings));
  };

  const onLimitLastLapsChange = (value: any) => {
    const curSettings = { ...userSettings, limitLastLaps: value };
    dispatch(updateRaceGraphRelative(curSettings));
  };

  // const props = {
  //   availableCars: selectableCars,
  //   availableClasses: carClasses.map((v) => v.name),
  //   selectedCars: showCars,
  //   selectedCarClasses: filterCarClasses,
  //   onSelectCarFilter: (selection: string[]) => {
  //     const curSettings = { ...userSettings, showCars: selection };
  //     dispatch(raceGraphRelativeSettings(curSettings));
  //     if (stateGlobalSettings.syncSelection) {
  //       dispatch(globalSettings({ ...stateGlobalSettings, showCars: selection }));
  //     }
  //   },
  //   onSelectCarClassFilter: onSelectCarClassChange,
  // };
  const graphProps = {
    showCars: props.selectedCars,
    referenceCarNum: props.selectedReferenceCar,
    limitLastLaps: userSettings.limitLastLaps,
    deltaRange: userSettings.deltaRange,
    height: 700,
  };
  // console.log(graphProps);
  return (
    <>
      <Row gutter={16}>
        <ReferenceCarFilter {...props} />
        <Col span={6}>
          <InputNumber
            // defaultValue={userSettings.deltaRange}
            value={userSettings.deltaRange}
            precision={0}
            step={10}
            min={0}
            style={{ width: "14ch" }}
            addonAfter={"sec"}
            // formatter={(v) => sprintf("%d sec", v)}
            // parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onDeltaRangeChange}
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

      <Delta {...graphProps} />
      {/* <RaceGraphByReferenceRecharts {...graphProps} /> */}
    </>
  );
};
