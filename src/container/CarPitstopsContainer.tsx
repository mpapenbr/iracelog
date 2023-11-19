import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Popover, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import {
  carNumberByCarIdx,
  collectCarsByCarClassFilter,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
  supportsCarData,
} from "../components/live/util";
import CarPitstopsNivo from "../components/nivo/carPitstops";
import PitstopControl from "../components/pitstopControl";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { globalSettings, pitstopsSettings } from "../stores/ui/actions";

export const CarPitstopsContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.pitstops);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const carData = useSelector((state: ApplicationState) => state.carData);

  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(
        raceOrder,
        stateCarManifest,
        supportsCarData(eventInfo.raceloggerVersion) ? carNumberByCarIdx(carData) : undefined,
      ),
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
      };
    } else {
      return {
        showCars: orderedShowCars(userSettings.showCars),
        filterCarClasses: userSettings.filterCarClasses,
      };
    }
  };
  const { showCars, filterCarClasses } = selectSettings();
  const dispatch = useDispatch();
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars,
  );
  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });

    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: newShowcars,
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(pitstopsSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(
        globalSettings({
          ...stateGlobalSettings,
          showCars: showCars,
          filterCarClasses: values,
        }),
      );
    }
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(pitstopsSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(globalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  const graphProps = {
    showCars: showCars,
    carPits: carPits,
    hideLongPitstops: userSettings.hideLongPitstops,
    hideThreshold: userSettings.hideThreshold,
  };
  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />

        <Popover content={<PitstopControl />} title="Configure settings">
          <Button icon={<SettingOutlined />} />
        </Popover>
        <Col offset={7} span={1}></Col>
      </Row>

      <CarPitstopsNivo {...graphProps} />
    </>
  );
};
