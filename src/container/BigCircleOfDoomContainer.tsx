import { ICarLaps, ICarPitInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Col, Form, InputNumber, Row, Select, Slider } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleOfDoom } from "../components/cod/circleofdoom";
import CarFilter from "../components/live/carFilter";
import {
  ICarFilterData,
  carNumberByCarIdx,
  collectCarsByCarClassFilter,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
  supportsCarData,
} from "../components/live/util";
import { ZoomTrackPos } from "../components/live/zoomTrackPos";
import { ReplayControl } from "../components/replayControl";
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
  // console.log("meanLap: " + meanLap);
  const avgSpeed = procData.eventInfo.trackLength / meanLap;
  // console.log("avgSpeed: " + avgSpeed);
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

export const BigCircleOfDoomContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carsRaw = useSelector((state: ApplicationState) => state.raceData.classification.data);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.circleOfDoom);
  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);
  const trackInfo = useSelector((state: ApplicationState) => state.raceData.trackInfo);
  const carInfos = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);

  const carData = useSelector((state: ApplicationState) => state.carData);
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
  const carIdxLookup = carNumberByCarIdx(carData);
  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(
        raceOrder,
        stateCarManifest,
        supportsCarData(eventInfo.raceloggerVersion) ? carIdxLookup : undefined,
      ),
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

    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: newShowcars,
      selectableCars: collectCarsByCarClassFilter(cars, values),
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(circleOfDoomSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(
        globalSettings({
          ...stateGlobalSettings,
          showCars: newShowcars,
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

  const getCarNumLegacy = (c: any): string => {
    return getValueViaSpec(c, stateCarManifest, "carNum");
  };

  const getCarNum = (c: any): string => {
    return carIdxLookup[getValueViaSpec(c, stateCarManifest, "carIdx")];
  };
  const dataRaw = carsRaw.map((c: any, idx: number) => ({
    carNum: supportsCarData(eventInfo.raceloggerVersion) ? getCarNum(c) : getCarNumLegacy(c),
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
  // console.log(`${posAfterPit}`);
  const pitstopProps: SelectPitstopProps = {
    pitstopTime: userSettings.pitstopTime,
    selectedCarNum: userSettings.referenceCarNum,
    availableCars: selectableCars,
    onPitStopTimeChanged: onPitStopTimeChanged,
    onSelectCar: onSelectReferenceCar,
  };

  const codSpan = replaySettings.enabled ? 16 : 20;
  const codCircle = replaySettings.enabled ? 380 : 380;
  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
      </Row>
      <Row gutter={16}>
        <Col span={codSpan}>
          <CircleOfDoom
            showCars={showCars}
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
                  showCars={showCars}
                  referenceCarNum={userSettings.referenceCarNum}
                  trackPos={trackPos}
                />
              </Col>
            </Row>
            {userSettings.pitstopTime > 0 ? (
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
        ) : (
          <></>
        )}
      </Row>
    </>
  );
};
