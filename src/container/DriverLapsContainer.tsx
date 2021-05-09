import { Col, InputNumber, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import CarFilter from "../components/live/carFilter";
import { collectCarsByCarClassFilter, processCarClassSelectionNew } from "../components/live/util";
import DriverLapsRecharts from "../components/recharts/driverLaps";
import { ApplicationState } from "../stores";
import { driverLapsSettings } from "../stores/ui/actions";

export const DriverLapsContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.driverLaps);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.driverLaps.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.driverLaps.filterCarClasses);
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
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    dispatch(driverLapsSettings(curSettings));
  };

  const onFilterRangeChange = (value: any) => {
    const curSettings = { ...userSettings, filterSecs: value };
    dispatch(driverLapsSettings(curSettings));
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(driverLapsSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
        <Col span={4}>
          <InputNumber
            defaultValue={userSettings.filterSecs}
            precision={0}
            step={10}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterRangeChange}
          />
        </Col>
      </Row>

      <DriverLapsRecharts />
    </>
  );
};
