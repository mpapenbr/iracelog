import { StintInfo } from "@buf/mpapenbr_iracelog.community_timostamm-protobuf-ts/iracelog/analysis/v1/car_stint_pb";
import { Col, Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import SingleSelectCarFilter from "../components/live/singleCarSelectFilter";
import { findDriverByStint, getCarPitStops, getCarStints } from "../components/live/util";
import { colorsBySeatTime, getCombinedStintData } from "../components/nivo/stintsummary/commons";
import StintSeatTime from "../components/nivo/stintsummary/seattime";
import StintBoxplot from "../components/nivo/stintsummary/stintboxplot";
import StintCircle from "../components/nivo/stintsummary/stintcircle";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import StintSummary from "../components/stintSummary";
import { useAppDispatch, useAppSelector } from "../stores";
import { ISingleCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateStintSummary } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./singleCarSelectFilterHelper";

const { Option } = Select;

export const StintSummaryContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.stintSummary);
  const carStints = useAppSelector((state) => state.carStints);
  const carPits = useAppSelector((state) => state.carPits);
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: ISingleCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateStintSummary(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(
          updateGlobalSettings({
            ...stateGlobalSettings,
            referenceCarNum: arg.referenceCarNum,
            filterCarClasses: arg.filterCarClasses,
          }),
        );
      }
    },
  };
  const filterProps = prepareFilterData(inputData);
  const xprops = {
    ...filterProps,
    selectedCar: userSettings.referenceCarNum,
    onSelectCarFilter: (selection: string) => {
      const curSettings = { ...userSettings, referenceCarNum: selection };
      dispatch(updateStintSummary(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, referenceCarNum: selection }));
      }
    },
  };

  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, carNum: value as string, showStint: 0 };
    dispatch(updateStintSummary(curSettings));
    dispatch(updateGlobalSettings({ ...stateGlobalSettings, referenceCarNum: curSettings.carNum }));
  };

  const currentCarInfo = carOccs.find((v) => v.carNum === userSettings.referenceCarNum);
  const { colorLookup } = colorsBySeatTime(currentCarInfo?.drivers ?? []);

  const driverColor = (si: StintInfo): string => {
    const driver = findDriverByStint(currentCarInfo!, si);
    if (driver) {
      return colorLookup.get(driver.name) ?? "black";
    }
    return "black";
  };
  const combinedData = getCombinedStintData(
    getCarStints(carStints, userSettings.referenceCarNum!),
    getCarPitStops(carPits, userSettings.referenceCarNum!),
    driverColor,
  );
  const combinedDataMinMax = combinedData.reduce(
    (a, b) => {
      return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
    },
    { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 },
  );
  const props = {
    carNum: userSettings.referenceCarNum,
    combinedStintData: combinedData,
    ...combinedDataMinMax,
  };
  // console.log(props);
  return (
    <>
      <Row gutter={16}>
        <SingleSelectCarFilter {...xprops} />
      </Row>
      {userSettings.referenceCarNum ? (
        <>
          <Divider />
          <Row gutter={16}>
            <StintStretch {...props} width={800} />
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <StintSummary {...props} />
            </Col>
            <Col span={12}>
              <Row>
                <StintSeatTime {...props} />
              </Row>
              <Row gutter={16}>
                <Col>
                  <StintCircle {...props} />
                </Col>
                {/* <Col>
                  <StintLaps {...props} />
                </Col> */}
              </Row>

              <Row>
                <StintBoxplot {...props} />
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
