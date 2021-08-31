import { Col, Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalWamp } from "../commons/globals";
import BoxPlot from "../components/dashboard/boxplot";
import Delta from "../components/dashboard/delta";
import Lapchart from "../components/dashboard/lapchart";
import CarFilter from "../components/live/carFilter";
import { CircleOfDoom } from "../components/live/circleofdoom";
import { collectCarsByCarClassFilter, processCarClassSelectionNew } from "../components/live/util";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { ApplicationState } from "../stores";
import { dashboardSettings, globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const DashboardContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.dashboard);
  const stintInfo = useSelector((state: ApplicationState) => state.raceData.carStints);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.dashboard.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.dashboard.filterCarClasses);

  const selectableCars = userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars;
  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: userSettings.filterCarClasses,
      currentShowCars: userSettings.showCars,
      newSelection: values,
    });
    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(dashboardSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, filterCarClasses: values }));
    }
  };

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

  const referenceOptions = selectableCars
    .filter((v) => showCars.includes(v.carNum))
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));
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
      </Row>
      {userSettings.showCars.length > 0 ? (
        <>
          <Divider />
          {userSettings.showCars.map((c) => (
            <Row gutter={16}>
              <StintStretch carNum={c} height={30} showCarNum width={800} />
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
