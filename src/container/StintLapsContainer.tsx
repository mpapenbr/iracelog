import { Col, InputNumber, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import CarClassFilter from "../components/live/carClassFilter";
import StintLapsRecharts from "../components/recharts/stintLaps";
import { ApplicationState } from "../stores";
import { driverStintsSettings } from "../stores/ui/actions";

const { Option } = Select;

export const StintLapsContainer: React.FC<{}> = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.driverStints);

  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(driverStintsSettings(curSettings));
  };

  const onFilterSecsChange = (value: any) => {
    const curSettings = { ...userSettings, filterSecs: value };
    dispatch(driverStintsSettings(curSettings));
  };

  const referenceOptions = cars
    .filter((c) => {
      return userSettings.filterCarClasses.length
        ? userSettings.filterCarClasses.find((item) => item === c.carClass)
        : true;
    })
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));
  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, carNum: value as string, showStint: 0 };
    dispatch(driverStintsSettings(curSettings));
    // setBrushKeeper({});
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <Select
            style={{ width: "100%" }}
            allowClear
            value={userSettings.carNum ? userSettings.carNum : undefined}
            placeholder="Select car"
            onChange={onSelectReferenceCar}
            maxTagCount="responsive"
          >
            {referenceOptions}
          </Select>
        </Col>
        <CarClassFilter
          availableClasses={carClasses.map((v) => v.name)}
          onSelectCarClassFilter={onSelectCarClassChange}
          selectedCarClasses={userSettings.filterCarClasses}
        />
        <Col span={4}>
          <InputNumber
            defaultValue={userSettings.filterSecs}
            precision={0}
            step={1}
            min={0}
            formatter={(v) => sprintf("%d sec", v)}
            parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
            onChange={onFilterSecsChange}
          />
        </Col>
      </Row>

      <StintLapsRecharts />
    </>
  );
};
