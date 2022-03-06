import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Divider, Empty, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import { globalWamp } from "../commons/globals";
import BoxPlot from "../components/dashboard/boxplot";
import Delta from "../components/dashboard/delta";
import Lapchart from "../components/dashboard/lapchart";
import CarFilter from "../components/live/carFilter";
import { CircleOfDoom } from "../components/live/circleofdoom";
import {
  collectCarsByCarClassFilter,
  findDriverByStint,
  getCarPitStops,
  getCarStints,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
} from "../components/live/util";
import { colorsBySeatTime, getCombinedStintData } from "../components/nivo/stintsummary/commons";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { dashboardSettings, globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const DashboardContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.dashboard);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);

  const rawShowCars = useSelector((state: ApplicationState) => state.userSettings.dashboard.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.dashboard.filterCarClasses);

  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(raceOrder, stateCarManifest)
    );
  };
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars
  );

  const orderedShowCars = (carNums: string[]): string[] => {
    return createSelectableCars(cars)
      .filter((c) => carNums.includes(c.carNum))
      .map((c) => c.carNum);
  };
  const showCars = orderedShowCars(rawShowCars);
  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });

    const sortedSelectabled = createSelectableCars(collectCarsByCarClassFilter(cars, values));

    const reorderedShowCars = sortedSelectabled.map((c) => c.carNum).filter((carNum) => showCars.includes(carNum));
    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: reorderedShowCars,
      selectableCars: sortedSelectabled,
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(dashboardSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, filterCarClasses: values }));
    }
  };
  // console.log(showCars);

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const newShowcars = selectableCars.filter((v) => selection.includes(v.carNum)).map((v) => v.carNum);
      const curSettings = { ...userSettings, showCars: newShowcars };
      dispatch(dashboardSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        const newGlobalShowCars = [...stateGlobalSettings.showCars];
        selection.forEach((item) => {
          if (!newGlobalShowCars.includes(item)) {
            newGlobalShowCars.push(item);
          }
        });
        if (newGlobalShowCars.length !== stateGlobalSettings.showCars.length) {
          dispatch(globalSettings({ ...stateGlobalSettings, showCars: newGlobalShowCars }));
        }
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, referenceCarNum: value as string };
    dispatch(dashboardSettings(curSettings));
    dispatch(globalSettings({ ...stateGlobalSettings, referenceCarNum: value as string }));
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(dashboardSettings(curSettings));
  };

  const onLimitLastLapsChange = (value: any) => {
    const curSettings = { ...userSettings, limitLastLaps: value };
    dispatch(dashboardSettings(curSettings));
  };

  const referenceOptions = selectableCars
    .filter((v) => showCars.includes(v.carNum))
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));

  const combinedData = showCars.map((carNum) => {
    const currentCarInfo = carInfo.find((v) => v.carNum === carNum)!;
    const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

    const driverColor = (si: IStintInfo): string =>
      colorLookup.get(findDriverByStint(currentCarInfo, si)?.driverName ?? "n.a.") ?? "black";
    return getCombinedStintData(getCarStints(carStints, carNum), getCarPitStops(carPits, carNum), driverColor);
  });
  const combinedDataMinMax = combinedData
    .flatMap((a) => [...a])
    .reduce(
      (a, b) => {
        return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
      },
      { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 }
    );

  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={userSettings.referenceCarNum}
            placeholder="Select reference car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarFilter {...props} />
        <Col span={6}>
          <InputNumber
            defaultValue={userSettings.deltaRange}
            precision={0}
            step={2}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onDeltaRangeChange}
          />
          {globalWamp.currentLiveId ? (
            <InputNumber
              defaultValue={userSettings.limitLastLaps}
              precision={0}
              step={5}
              min={0}
              formatter={(v) => sprintf("%d laps", v)}
              parser={(v) => (v !== undefined ? parseInt(v.replace("laps", "")) : 0)}
              onChange={onLimitLastLapsChange}
            />
          ) : (
            <></>
          )}
        </Col>
      </Row>
      {userSettings.showCars.length > 0 ? (
        <>
          <Divider />
          {combinedData.map((c, idx) => (
            <Row gutter={16} key={idx}>
              <StintStretch
                carNum={c[0]?.data.carNum ?? "n.a."}
                height={30}
                showCarNum
                width={800}
                {...combinedDataMinMax}
                combinedStintData={c}
              />
            </Row>
          ))}
          <Row gutter={16}>
            <Col span={12}>
              <Lapchart />
            </Col>
            <Col span={12}>
              <BoxPlot />
            </Col>
          </Row>
          {globalWamp.currentLiveId ? (
            <Row gutter={16}>
              <Col span={12}>
                <Delta />
              </Col>
              <Col span={12}>
                <CircleOfDoom referenceCarNum={""} pitstopTime={0} showCars={showCars} />
              </Col>
            </Row>
          ) : (
            <Row gutter={16}>
              <Col span={24}>
                <Delta />
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
