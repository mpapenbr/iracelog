import { Checkbox, Col, InputNumber, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import LeaderGraph from "../components/antcharts/leadergraph";
import CarFilter from "../components/live/carFilter";
import {
  collectCarsByCarClassFilter,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
} from "../components/live/util";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { raceGraphSettings } from "../stores/ui/actions";

export const RaceGraphContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraph);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);
  const rawShowCars = useSelector((state: ApplicationState) => state.userSettings.raceGraph.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.raceGraph.filterCarClasses);
  const dispatch = useDispatch();

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
  const showCars = orderedShowCars(rawShowCars);
  console.log(showCars);
  const orderedSelectableCars = createSelectableCars(
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
    dispatch(raceGraphSettings(curSettings));
  };

  const onSelectCarClassChangeOld = (values: string[]) => {
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
    dispatch(raceGraphSettings(curSettings));
  };

  const onCheckboxChange = () => {
    const curSettings = { ...userSettings, gapRelativeToClassLeader: !userSettings.gapRelativeToClassLeader };
    dispatch(raceGraphSettings(curSettings));
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(raceGraphSettings(curSettings));
  };

  const props = {
    availableCars: orderedSelectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(raceGraphSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
        <Col span={4}>
          <InputNumber
            defaultValue={userSettings.deltaRange}
            precision={0}
            step={10}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onDeltaRangeChange}
          />
        </Col>
        <Col span={3}>
          <Checkbox
            defaultChecked={userSettings.gapRelativeToClassLeader}
            checked={userSettings.gapRelativeToClassLeader}
            onChange={onCheckboxChange}
          >
            Gaps relative to class leader
          </Checkbox>
        </Col>
      </Row>

      <LeaderGraph showCars={showCars} />
      {/* <RaceGraphRecharts /> */}
    </>
  );
};
