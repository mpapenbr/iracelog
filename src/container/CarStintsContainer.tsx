import { Col, Radio, RadioChangeEvent, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import {
  collectCarsByCarClassFilter,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
} from "../components/live/util";
import CarStintsNivo from "../components/nivo/carStints";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { globalSettings, stintsSettings } from "../stores/ui/actions";

export const CarStintsContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stints);
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
      };
    } else {
      return { showCars: orderedShowCars(userSettings.showCars), filterCarClasses: userSettings.filterCarClasses };
    }
  };
  const { showCars, filterCarClasses } = selectSettings();
  const dispatch = useDispatch();
  const selectableCars = userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars;
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
    dispatch(stintsSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, showCars: reorderedShowCars, filterCarClasses: values }));
    }
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(stintsSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(globalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };
  const graphProps = {
    showCars: showCars,
    carStints: carStints,
    carInfo: carInfo,
    showAsLabel: userSettings.showAsLabel,
  };
  const onShowModeChange = (e: RadioChangeEvent) => {
    dispatch(stintsSettings({ ...userSettings, showAsLabel: e.target.value }));
  };
  const ShowMode = (
    <Col>
      <Radio.Group onChange={onShowModeChange} value={userSettings.showAsLabel}>
        <Radio.Button value="duration">Duration</Radio.Button>
        <Radio.Button value="laps">Laps</Radio.Button>
      </Radio.Group>
    </Col>
  );
  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
        {ShowMode}
      </Row>

      <CarStintsNivo {...graphProps} />
    </>
  );
};
