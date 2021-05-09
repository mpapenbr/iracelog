import { Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import { collectCarsByCarClassFilter, processCarClassSelectionNew } from "../components/live/util";
import CarPitstopsNivo from "../components/nivo/carPitstops";
import { ApplicationState } from "../stores";
import { pitstopsSettings } from "../stores/ui/actions";

export const CarPitstopsContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.pitstops);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.pitstops.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.pitstops.filterCarClasses);
  const dispatch = useDispatch();
  const selectableCars = userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars;
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
    dispatch(pitstopsSettings(curSettings));
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(pitstopsSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
      </Row>

      <CarPitstopsNivo />
    </>
  );
};
