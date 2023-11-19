import { Checkbox, Col, Row } from "antd";
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
import RacePositionGraphNivo from "../components/nivo/racePositionGraph";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { racePositionsSettings } from "../stores/ui/actions";

export const RacePositionsContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.racePositions);

  const showCars = useSelector(
    (state: ApplicationState) => state.userSettings.racePositions.showCars,
  );
  const filterCarClasses = useSelector(
    (state: ApplicationState) => state.userSettings.racePositions.filterCarClasses,
  );
  const dispatch = useDispatch();

  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);
  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const carData = useSelector((state: ApplicationState) => state.carData);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(
        raceOrder,
        stateCarManifest,
        supportsCarData(eventInfo.raceloggerVersion) ? carNumberByCarIdx(carData) : undefined,
      ),
    );
  };

  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars,
  );

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
      showCars: newShowcars,
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    dispatch(racePositionsSettings(curSettings));
  };
  const onCheckboxChange = () => {
    dispatch(
      racePositionsSettings({ ...userSettings, showPosInClass: !userSettings.showPosInClass }),
    );
  };
  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(racePositionsSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
        <Col span={3}>
          <Checkbox
            defaultChecked={userSettings.showPosInClass}
            checked={userSettings.showPosInClass}
            onChange={onCheckboxChange}
          >
            Show position in class
          </Checkbox>
        </Col>
      </Row>

      <RacePositionGraphNivo />
    </>
  );
};
