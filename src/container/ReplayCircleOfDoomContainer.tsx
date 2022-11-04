import { SettingOutlined } from "@ant-design/icons";
import { ICarLaps, ICarPitInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Button, Col, Form, InputNumber, Popover, Row, Select, Slider } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import { CircleOfDoom } from "../components/live/circleofdoom";
import {
  collectCarsByCarClassFilter,
  ICarFilterData,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
} from "../components/live/util";
import { ZoomTrackPos } from "../components/live/zoomTrackPos";
import { ReplayControl } from "../components/replayControl";
import { Standings } from "../components/standings";
import StandingsColumnControl from "../components/standingsColumnControl";
import { ApplicationState } from "../stores";
import { ICarBaseData, IEventInfo } from "../stores/racedata/types";
import { circleOfDoomSettings, globalSettings } from "../stores/ui/actions";

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
  carLaps: ICarLaps;
  pitInfo: ICarPitInfo;
  eventInfo: IEventInfo;
  pitstopTime: number;
  trackPos: number;
}
const newPosAfterPitstop = (procData: IProcData): number => {
  let sortedLaps = procData.carLaps?.laps.map((v) => v.lapTime).sort();
  if (sortedLaps === undefined) sortedLaps = [];
  const meanLap = sortedLaps[Math.ceil(sortedLaps.length / 2)];
  console.log("meanLap: " + meanLap);
  const avgSpeed = procData.eventInfo.trackLength / meanLap;
  console.log("avgSpeed: " + avgSpeed);
  // console.table(procData.pitInfo);

  let inPits = 0;
  if (procData.pitInfo && procData.pitInfo.current.isCurrentPitstop) {
    console.log("car is in pits for " + procData.pitInfo.current.laneTime);
    inPits = procData.pitInfo.current.laneTime;
  }
  const newPos =
    (1 +
      procData.trackPos -
      (avgSpeed * (procData.pitstopTime - inPits)) / procData.eventInfo.trackLength) %
    1;
  return newPos;
};

export const ReplayCircleOfDoomContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.circleOfDoom);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  const trackInfo = useSelector((state: ApplicationState) => state.raceData.trackInfo);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);

  const replaySettings = useSelector((state: ApplicationState) => state.userSettings.replay);
  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const selectSettings = () => {
    if (stateGlobalSettings.syncSelection) {
      return {
        showCars: stateGlobalSettings.showCars,
        filterCarClasses: stateGlobalSettings.filterCarClasses,
      };
    } else {
      return { showCars: userSettings.showCars, filterCarClasses: userSettings.filterCarClasses };
    }
  };

  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(raceOrder, stateCarManifest),
    );
  };
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars,
  );
  const { showCars, filterCarClasses } = selectSettings();

  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });

    const sortedSelectabled = createSelectableCars(collectCarsByCarClassFilter(cars, values));

    const reorderedShowCars = sortedSelectabled
      .map((c) => c.carNum)
      .filter((carNum) => newShowcars.includes(carNum));

    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: reorderedShowCars,
      selectableCars: sortedSelectabled,
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(circleOfDoomSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(
        globalSettings({
          ...stateGlobalSettings,
          showCars: reorderedShowCars,
          filterCarClasses: values,
        }),
      );
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

  const dataRaw = carsRaw.map((c: any, idx: number) => ({
    carNum: getValueViaSpec(c, stateCarManifest, "carNum"),
    trackPos: getValueViaSpec(c, stateCarManifest, "trackPos"),
    // state: getValueViaSpec(c, stateCarManifest, "state"),
    // pos: idx,
    // pic: getValueViaSpec(c, stateCarManifest, "pic"),
    // lap: getValueViaSpec(c, stateCarManifest, "lap"),
  }));
  // console.log(`${dataRaw}`);
  const trackPos =
    dataRaw.find((c: any) => c.carNum === userSettings.referenceCarNum)?.trackPos ?? -1;
  // .filter((c: any) => c.carNum == userSettings.referenceCarNum);
  const posAfterPit = newPosAfterPitstop({
    carLaps: carLaps.find((c) => c.carNum === userSettings.referenceCarNum)!,
    pitInfo: carPits.find((c) => c.carNum === userSettings.referenceCarNum)!,
    eventInfo,
    pitstopTime: userSettings.pitstopTime,
    trackPos,
  });
  console.log(`${posAfterPit}`);
  const pitstopProps: SelectPitstopProps = {
    pitstopTime: userSettings.pitstopTime,
    selectedCarNum: userSettings.referenceCarNum,
    availableCars: selectableCars,
    onPitStopTimeChanged: onPitStopTimeChanged,
    onSelectCar: onSelectReferenceCar,
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
        <Col span={18}>
          <Row>
            <Col span="24">
              <Row gutter={16}>
                <Col span="12">
                  <SelectPitStopParam {...pitstopProps} />
                </Col>
                <Col span="12">{replaySettings.enabled ? <ReplayControl /> : <></>}</Col>
              </Row>
            </Col>
          </Row>
          {userSettings.referenceCarNum ? (
            <Row>
              <Col span="24">
                <ZoomTrackPos
                  showCars={showCars}
                  referenceCarNum={userSettings.referenceCarNum}
                  trackPos={trackPos}
                />
              </Col>
            </Row>
          ) : (
            <></>
          )}

          {userSettings.referenceCarNum && userSettings.pitstopTime > 0 ? (
            <Row>
              <Col span="24">
                <ZoomTrackPos
                  showCars={showCars}
                  referenceCarNum={userSettings.referenceCarNum}
                  trackPos={posAfterPit}
                />
              </Col>
            </Row>
          ) : (
            <></>
          )}
        </Col>
      </Row>

      <Standings showCars={showCars} />
    </>
  );
};
