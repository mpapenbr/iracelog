import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, InputNumber, Popover, Row, Select, Slider } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sprintf } from "sprintf-js";
import CarFilter from "../components/live/carFilter";
import { CircleOfDoom } from "../components/live/circleofdoom";
import { collectCarsByCarClassFilter, processCarClassSelectionNew } from "../components/live/util";
import { ReplayControl } from "../components/replayControl";
import SessionInfoDescription from "../components/sessionInfoDescr";
import { Standings } from "../components/standings";
import StandingsColumnControl from "../components/standingsColumnControl";
import { ApplicationState } from "../stores";
import { circleOfDoomSettings, globalSettings } from "../stores/ui/actions";

const { Option } = Select;

export const ReplayCircleOfDoomContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.circleOfDoom);

  const replaySettings = useSelector((state: ApplicationState) => state.userSettings.replay);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const selectSettings = () => {
    if (stateGlobalSettings.syncSelection) {
      return { showCars: stateGlobalSettings.showCars, filterCarClasses: stateGlobalSettings.filterCarClasses };
    } else {
      return { showCars: userSettings.showCars, filterCarClasses: userSettings.filterCarClasses };
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
    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: newShowcars,
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    dispatch(circleOfDoomSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, showCars: newShowcars, filterCarClasses: values }));
    }
  };

  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, referenceCarNum: value as string };
    dispatch(circleOfDoomSettings(curSettings));
  };
  const onPitStopTimeChanged = (value: any) => {
    const curSettings = { ...userSettings, pitstopTime: value as number };
    dispatch(circleOfDoomSettings(curSettings));
  };
  const onCalcSpeedChanged = (value: any) => {
    const curSettings = { ...userSettings, calcSpeed: value as number };
    dispatch(circleOfDoomSettings(curSettings));
  };

  const referenceOptions = selectableCars
    .filter((d) => showCars.includes(d.carNum))
    .map((d) => (
      <Option key={d.carNum} value={d.carNum}>
        #{d.carNum} {d.name}
      </Option>
    ));
  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(circleOfDoomSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(globalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  const SelectPitStopParam: React.FC = () => {
    return (
      <>
        <Select
          style={{ width: "100%" }}
          allowClear
          value={userSettings.referenceCarNum}
          placeholder="Select car for pitstop"
          onChange={onSelectReferenceCar}
          maxTagCount="responsive"
        >
          {referenceOptions}
        </Select>
        <Form>
          <Form.Item label="Pitstop time">
            <InputNumber
              defaultValue={userSettings.pitstopTime}
              placeholder="pitstop time"
              precision={0}
              step={1}
              min={0}
              formatter={(v) => sprintf("%d sec", v)}
              parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
              onChange={onPitStopTimeChanged}
            />
          </Form.Item>
          <Form.Item label="Pitstop time">
            <Slider min={0} max={120} defaultValue={userSettings.pitstopTime} onAfterChange={onPitStopTimeChanged} />
          </Form.Item>
        </Form>
      </>
    );
  };

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />

        <Col offset={9} span={1}>
          <Popover content={<StandingsColumnControl />} title="Select columns">
            <Button icon={<SettingOutlined />} />
          </Popover>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span="6">
          <CircleOfDoom
            showCars={showCars}
            referenceCarNum={userSettings.referenceCarNum}
            pitstopTime={userSettings.pitstopTime}
          />
        </Col>
        <Col span="18">
          <Row gutter={16}>
            <Col span="12">
              <SelectPitStopParam />
            </Col>

            <Col span="12">{replaySettings.enabled ? <ReplayControl /> : <></>}</Col>
          </Row>
          <Row>
            <Col span="23">
              <SessionInfoDescription />
            </Col>
          </Row>
        </Col>
      </Row>

      <Standings showCars={showCars} />
    </>
  );
};
