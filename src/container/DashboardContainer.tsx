import { StintInfo } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_stint_pb";
import { Col, Divider, Empty, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { globalWamp } from "../commons/globals";
//import BoxPlot from "../components/dashboard/boxplot";
import Delta from "../components/antcharts/deltagraph";
import Lapchart from "../components/antcharts/lapchart";
import BoxPlot from "../components/dashboard/boxplot";
import { CircleOfDoom } from "../components/live/circleofdoom";
import ReferenceCarFilter from "../components/live/referenceCarSelectFilter";
import { findDriverByStint, getCarPitStops, getCarStints } from "../components/live/util";
import {
  CombinedStintData,
  colorsBySeatTime,
  getCombinedStintData,
} from "../components/nivo/stintsummary/commons";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { useAppDispatch, useAppSelector } from "../stores";
import { IReferenceCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateDashboard, updateGlobalSettings } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./referenceCarSelectFilterHelper";

const { Option } = Select;

export const DashboardContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const carPits = useAppSelector((state) => state.carPits);
  const carStints = useAppSelector((state) => state.carStints);
  const carOccs = useAppSelector((state) => state.carOccupancies);
  const userSettings = useAppSelector((state) => state.userSettings.dashboard);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const dispatch = useAppDispatch();

  // containerWidth state and ref (copilot proposal)
  const containerRef = React.useRef<HTMLDivElement>(null); // Step 1: Create a ref for the container
  const [containerWidth, setContainerWidth] = React.useState(0); // Step 2: Initialize state for the container's width

  React.useEffect(() => {
    const updateWidth = () => {
      // Check if the container ref is current and update the width
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth(); // Set initial width

    window.addEventListener("resize", updateWidth); // Update width on resize

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Use containerWidth as needed in your component
  // console.log(containerWidth); // For demonstration, logs the current container width

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    autoFillCars: false,

    selectedCallback: (arg: IReferenceCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateDashboard(curSettings));
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
      dispatch(updateDashboard(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectReferenceCar: (selection: string) => {
      const curSettings = { ...userSettings, referenceCarNum: selection };
      dispatch(updateDashboard(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, referenceCarNum: selection }));
      }
    },
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(updateDashboard(curSettings));
  };

  const onLimitLastLapsChange = (value: any) => {
    const curSettings = { ...userSettings, limitLastLaps: value };
    dispatch(updateDashboard(curSettings));
  };

  // TODO: refactor to helper method (used in StrategyContainer as well)

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
  const graphHeight = 500;
  return (
    <div ref={containerRef}>
      <Row gutter={16}>
        <ReferenceCarFilter {...props} />
        <Col span={6}>
          <InputNumber
            // defaultValue={userSettings.deltaRange}
            value={userSettings.deltaRange}
            precision={0}
            step={2}
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
      {filterProps.selectedCars.length > 0 ? (
        <>
          <Divider />
          {combinedData.map((c, idx) => (
            <Row gutter={16} key={idx}>
              <StintStretch
                carNum={c.carNum}
                height={30}
                showCarNum
                width={containerWidth}
                {...combinedDataMinMax}
                combinedStintData={c.combined}
              />
            </Row>
          ))}
          <Row gutter={16}>
            <Col span={12}>
              <Lapchart
                showCars={[...props.selectedCars]}
                limitLastLaps={userSettings.limitLastLaps}
                filterSecs={0}
                height={graphHeight}
              />
            </Col>
            <Col span={12}>
              <BoxPlot showCars={[...props.selectedCars]} height={graphHeight} />
            </Col>
          </Row>
          {globalWamp.currentLiveId ? (
            <Row gutter={16}>
              <Col span={12}>
                <Delta
                  referenceCarNum={props.selectedReferenceCar}
                  showCars={[...props.selectedCars]}
                  limitLastLaps={userSettings.limitLastLaps}
                  deltaRange={userSettings.deltaRange}
                  height={graphHeight}
                />
              </Col>
              <Col span={12}>
                <CircleOfDoom
                  referenceCarNum={""}
                  pitstopTime={0}
                  showCars={filterProps.selectedCars}
                />
              </Col>
            </Row>
          ) : (
            <Row gutter={16}>
              <Col span={24}>
                <Delta
                  referenceCarNum={props.selectedReferenceCar}
                  showCars={[...props.selectedCars]}
                  limitLastLaps={0}
                  deltaRange={userSettings.deltaRange}
                  height={graphHeight}
                />
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
};
