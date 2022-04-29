import { Col, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalWamp } from "../commons/globals";
import Delta from "../components/antcharts/deltagraph";
import CarFilter from "../components/live/carFilter";
import {
  collectCarsByCarClassFilter,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
} from "../components/live/util";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { globalSettings, raceGraphRelativeSettings } from "../stores/ui/actions";

const { Option } = Select;

export const RaceGraphByReferenceContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);

  const userSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraphRelative);

  // const showCars = useSelector((state: ApplicationState) => state.userSettings.raceGraphRelative.showCars);
  // const filterCarClasses = useSelector(
  //   (state: ApplicationState) => state.userSettings.raceGraphRelative.filterCarClasses
  // );
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);
  const stateCarManifest = useSelector((state: ApplicationState) => state.wamp.data.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(raceOrder, stateCarManifest)
    );
  };
  const orderedShowCars = (carNums: string[]): string[] => {
    return createSelectableCars(cars)
      .filter((c) => carNums.includes(c.carNum))
      .map((c) => c.carNum);
  };
  const selectSettings = () => {
    if (stateGlobalSettings.syncSelection) {
      return {
        showCars: orderedShowCars(stateGlobalSettings.showCars),
        filterCarClasses: stateGlobalSettings.filterCarClasses,
        referenceCarNum: stateGlobalSettings.referenceCarNum,
      };
    } else {
      return {
        showCars: orderedShowCars(userSettings.showCars),
        filterCarClasses: userSettings.filterCarClasses,
        referenceCarNum: userSettings.referenceCarNum,
      };
    }
  };

  const { showCars, filterCarClasses, referenceCarNum } = selectSettings();
  const dispatch = useDispatch();
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars
  );
  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });

    const sortedSelectabled = createSelectableCars(collectCarsByCarClassFilter(cars, values));

    const reorderedShowCars = sortedSelectabled.map((c) => c.carNum).filter((carNum) => newShowcars.includes(carNum));

    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: reorderedShowCars,
      selectableCars: sortedSelectabled,
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(raceGraphRelativeSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, showCars: reorderedShowCars, filterCarClasses: values }));
    }
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(raceGraphRelativeSettings(curSettings));
  };

  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, referenceCarNum: value as string };
    dispatch(raceGraphRelativeSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, referenceCarNum: value as string }));
    }
  };
  const onLimitLastLapsChange = (value: any) => {
    const curSettings = { ...userSettings, limitLastLaps: value };
    dispatch(raceGraphRelativeSettings(curSettings));
  };

  const referenceOptions = selectableCars.map((d) => (
    <Option key={d.carNum} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(raceGraphRelativeSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(globalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };
  const graphProps = { showCars, referenceCarNum };
  return (
    <>
      <Row gutter={16}>
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={referenceCarNum}
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
