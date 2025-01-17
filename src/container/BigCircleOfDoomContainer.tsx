import { Col, Form, InputNumber, Row, Select, Slider } from "antd";
import * as React from "react";

import { CarLaps } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_laps_pb";
import { CarPit } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/car_pit_pb";
import { Car } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_pb";
import { CircleOfDoom } from "../components/cod/circleofdoom";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { ICarFilterData } from "../components/live/util";
import { ZoomTrackPos } from "../components/live/zoomTrackPos";
import { ReplayControl } from "../components/replayControl";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateCircleOfDoom, updateGlobalSettings } from "../stores/grpc/slices/userSettingsSlice";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";
const { Option } = Select;

interface SelectPitstopProps {
  availableCars: ICarFilterData[];
  selectedCarNum: string;
  pitstopTime: number;
  onSelectCar: (value: string) => void;
  onPitStopTimeChanged: (value: any) => void;
}

const SelectPitStopParam: React.FC<SelectPitstopProps> = (props: SelectPitstopProps) => {
  const referenceOptions = props.availableCars.map((d) => (
    <Option key={d.carNum} value={d.carNum}>
      #{d.carNum} {d.name}
    </Option>
  ));
  return (
    <>
      <Select
        style={{ width: "100%" }}
        allowClear
        value={props.selectedCarNum}
        placeholder="Select car for pitstop"
        onChange={props.onSelectCar}
        maxTagCount="responsive"
      >
        {referenceOptions}
      </Select>
      <Form>
        <InputNumber
          // defaultValue={props.pitstopTime}
          value={props.pitstopTime}
          placeholder="pitstop time"
          // prefix="Pitstop"
          style={{ width: "27ch" }}
          addonAfter={"sec"}
          addonBefore={"Pitstop time"}
          precision={0}
          step={1}
          min={0}
          // formatter={(v) => sprintf("%d sec", v)}
          // parser={(v) => (v !== undefined ? parseInt(v.replace("sec", "")) : 0)}
          onChange={props.onPitStopTimeChanged}
        />

        <Form.Item label="Pitstop time">
          <Slider
            min={0}
            max={120}
            defaultValue={props.pitstopTime}
            onAfterChange={props.onPitStopTimeChanged}
          />
        </Form.Item>
      </Form>
    </>
  );
};

interface IProcData {
  carLaps: CarLaps;
  pitInfo: CarPit;
  trackLength: number;
  pitstopTime: number;
  trackPos: number;
}
const newPosAfterPitstop = (procData: IProcData): number => {
  let sortedLaps = procData.carLaps?.laps.map((v) => v.lapTime).sort();
  if (sortedLaps === undefined) sortedLaps = [];
  const meanLap = sortedLaps[Math.ceil(sortedLaps.length / 2)];
  // console.log("meanLap: " + meanLap);
  const avgSpeed = procData.trackLength / meanLap;
  // console.log("avgSpeed: " + avgSpeed);
  // console.table(procData.pitInfo);

  let inPits = 0;
  if (procData.pitInfo && procData.pitInfo.current?.isCurrentPitstop) {
    console.log("car is in pits for " + procData.pitInfo.current.laneTime);
    inPits = procData.pitInfo.current.laneTime;
  }
  const newPos =
    (1 + procData.trackPos - (avgSpeed * (procData.pitstopTime - inPits)) / procData.trackLength) %
    1;
  return newPos;
};

export const BigCircleOfDoomContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carsRaw = useAppSelector((state) => state.classification);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.circleOfDoom);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carPits = useAppSelector((state) => state.carPits);
  const eventInfo = useAppSelector((state) => state.eventInfo);
  const replaySettings = useAppSelector((state) => state.userSettings.replay);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const entryByIdx = useAppSelector((state) => state.byIdxLookup.carNum);
  const dispatch = useAppDispatch();

  const onSelectReferenceCar = (value: any) => {
    const curSettings = { ...userSettings, referenceCarNum: value as string };
    dispatch(updateCircleOfDoom(curSettings));
  };
  const onPitStopTimeChanged = (value: any) => {
    const curSettings = { ...userSettings, pitstopTime: value as number };
    dispatch(updateCircleOfDoom(curSettings));
  };

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,

    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: IMultiCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateCircleOfDoom(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(
          updateGlobalSettings({
            ...stateGlobalSettings,
            showCars: arg.showCars,
            filterCarClasses: arg.filterCarClasses,
          }),
        );
      }
    },
  };
  const filterProps = prepareFilterData(inputData);
  const props = {
    ...filterProps,
    onSelectCarFilter: (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(updateCircleOfDoom(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const dataRaw = carsRaw.map((c: Car) => ({
    carNum: entryByIdx[c.carIdx],
    trackPos: c.trackPos,
  }));
  // console.log(`${dataRaw}`);
  const trackPos =
    dataRaw.find((c: any) => c.carNum === userSettings.referenceCarNum)?.trackPos ?? -1;
  // .filter((c: any) => c.carNum == userSettings.referenceCarNum);
  const posAfterPit = newPosAfterPitstop({
    carLaps: carLaps.find((c) => c.carNum === userSettings.referenceCarNum)!,
    pitInfo: carPits.find((c) => c.carNum === userSettings.referenceCarNum)!,
    trackLength: eventInfo.track.length,
    pitstopTime: userSettings.pitstopTime,
    trackPos,
  });
  // console.log(`${posAfterPit}`);
  const pitstopProps: SelectPitstopProps = {
    pitstopTime: userSettings.pitstopTime,
    selectedCarNum: userSettings.referenceCarNum,
    availableCars: filterProps.availableCars,
    onPitStopTimeChanged: onPitStopTimeChanged,
    onSelectCar: onSelectReferenceCar,
  };

  const codSpan = replaySettings.enabled ? 16 : 20;
  const codCircle = replaySettings.enabled ? 380 : 380;
  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
      </Row>
      <Row gutter={16}>
        <Col span={codSpan}>
          <CircleOfDoom
            showCars={filterProps.selectedCars}
            referenceCarNum={userSettings.referenceCarNum}
            pitstopTime={userSettings.pitstopTime}
            circleSize={codCircle}
          />
        </Col>
        <Col span="8">{replaySettings.enabled ? <ReplayControl /> : <></>}</Col>
      </Row>
      <Row>
        <Col span="11">
          <SelectPitStopParam {...pitstopProps} />
        </Col>

        {userSettings.referenceCarNum ? (
          <Col span="12">
            <Row>
              <Col span="24">
                <ZoomTrackPos
                  showCars={filterProps.selectedCars}
                  referenceCarNum={userSettings.referenceCarNum}
                  trackPos={trackPos}
                />
              </Col>
            </Row>
            {userSettings.pitstopTime > 0 ? (
              <Row>
                <Col span="24">
                  <ZoomTrackPos
                    showCars={filterProps.selectedCars}
                    referenceCarNum={userSettings.referenceCarNum}
                    trackPos={posAfterPit}
                  />
                </Col>
              </Row>
            ) : (
              <></>
            )}
          </Col>
        ) : (
          <></>
        )}
      </Row>
    </>
  );
};
