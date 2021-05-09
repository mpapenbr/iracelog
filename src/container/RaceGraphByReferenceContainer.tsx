import { Col, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import CarFilter from "../components/live/carFilter";
import { processCarClassSelectionNew } from "../components/live/util";
import RaceGraphByReferenceRecharts from "../components/recharts/raceGraphByReferenceRecharts";
import { ApplicationState } from "../stores";
import { raceGraphRelativeSettings } from "../stores/ui/actions";

const { Option } = Select;

export const RaceGraphByReferenceContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);

  const userSettings = useSelector((state: ApplicationState) => state.userSettings.raceGraphRelative);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.raceGraphRelative.showCars);
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.raceGraph.filterCarClasses);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: userSettings.filterCarClasses,
      currentShowCars: userSettings.showCars,
      newSelection: values,
    });
    const curSettings = { ...userSettings, filterCarClasses: values, showCars: newShowcars };
    dispatch(raceGraphRelativeSettings(curSettings));
  };

  const onDeltaRangeChange = (value: any) => {
    const curSettings = { ...userSettings, deltaRange: value };
    dispatch(raceGraphRelativeSettings(curSettings));
  };

  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, referenceCarNum: value as string };
    dispatch(raceGraphRelativeSettings(curSettings));
  };

  const referenceOptions = cars.map((d) => (
    <Option key={d.carNum} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));

  const props = {
    availableCars: cars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(raceGraphRelativeSettings(curSettings));
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

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
      </Row>

      <RaceGraphByReferenceRecharts />
    </>
  );
};
