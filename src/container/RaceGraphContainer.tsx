import { ICarInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Checkbox, Col, InputNumber, Row } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import CarFilter from "../components/live/carFilter";
import { processCarClassSelectionNew } from "../components/live/util";
import RaceGraphRecharts from "../components/recharts/raceGraphRecharts";
import { ApplicationState } from "../stores";
import { raceGraphSettings } from "../stores/ui/actions";

export const RaceGraphContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  // const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carInfo = [] as ICarInfo[];
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraph);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.raceGraph.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.raceGraph.filterCarClasses);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    // get removed car classes

    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: userSettings.filterCarClasses,
      currentShowCars: userSettings.showCars,
      newSelection: values,
    });
    const curSettings = { ...userSettings, filterCarClasses: values, showCars: newShowcars };
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
    availableCars: cars,
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

      <RaceGraphRecharts />
    </>
  );
};
