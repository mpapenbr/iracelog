import { StintInfo } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_stint_pb";
import { Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { findDriverByStint, getCarPitStops, getCarStints } from "../components/live/util";
import {
  CombinedStintData,
  colorsBySeatTime,
  getCombinedStintData,
} from "../components/nivo/stintsummary/commons";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateStrategy } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

const { Option } = Select;

export const StrategyContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carsRaw = useAppSelector((state) => state.classification);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.strategy);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carPits = useAppSelector((state) => state.carPits);
  const carStints = useAppSelector((state) => state.carStints);
  const carOccs = useAppSelector((state) => state.carOccupancies);

  const eventInfo = useAppSelector((state) => state.eventInfo);
  const replaySettings = useAppSelector((state) => state.userSettings.replay);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const entryByIdx = useAppSelector((state) => state.byIdxLookup.carNum);
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
      dispatch(updateStrategy(curSettings));
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
      dispatch(updateStrategy(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  interface ICarCombinedStintData {
    carNum: string;
    data: CombinedStintData[];
  }
  const combinedData = filterProps.selectedCars.map((carNum) => {
    const currentCarInfo = carOccs.find((v) => v.carNum === carNum)!;
    const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);
    const driverColor = (si: StintInfo): string =>
      colorLookup.get(findDriverByStint(currentCarInfo, si)?.name ?? "n.a.") ?? "black";
    return {
      carNum: carNum,
      combined: getCombinedStintData(
        getCarStints(carStints, carNum),
        getCarPitStops(carPits, carNum),
        driverColor,
      ),
    };
  });
  const combinedDataMinMax = combinedData
    .flatMap((a) => [...a.combined])
    .reduce(
      (a, b) => {
        return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
      },
      { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 },
    );

  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
      </Row>
      {filterProps.selectedCars.length > 0 ? (
        <>
          <Divider />
          {combinedData.map((c, idx) => (
            <Row gutter={16} key={idx}>
              <StintStretch
                carNum={c.carNum}
                height={30}
                showCarNum
                width={800}
                {...combinedDataMinMax}
                combinedStintData={c.combined}
              />
            </Row>
          ))}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
