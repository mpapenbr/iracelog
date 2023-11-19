import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { getValueViaSpec } from "@mpapenbr/iracelog-analysis/dist/stints/util";
import { Col, Divider, Empty, Row, Select, Slider } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalWamp } from "../commons/globals";
import CarFilter from "../components/live/carFilter";
import { assignCarColors } from "../components/live/colorAssignment";
import { stintLaps } from "../components/live/statsutil";
import {
  carNumberByCarIdx,
  collectCarsByCarClassFilter,
  getCarStints,
  isInSelectedRange,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
  supportsCarData,
} from "../components/live/util";
import { getCombinedStintData } from "../components/nivo/stintsummary/commons";
import StintRankingSvg from "../components/stintRanking/rankingSvg";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { globalSettings, stintRankingSettings } from "../stores/ui/actions";
import { IStintRankingSettings } from "../stores/ui/types";
import { secAsHHMMSS } from "../utils/output";

const { Option } = Select;

export const StintRankingContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.stintRanking);
  const sInfo = useSelector((state: ApplicationState) => state.raceData.sessionInfo);
  const manifestData = useSelector((state: ApplicationState) => state.raceData.manifests.session);

  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);

  const carLaps = useSelector((state: ApplicationState) => state.raceData.carLaps);

  const showCars = useSelector(
    (state: ApplicationState) => state.userSettings.stintRanking.showCars,
  );
  const filterCarClasses = useSelector(
    (state: ApplicationState) => state.userSettings.stintRanking.filterCarClasses,
  );

  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const carData = useSelector((state: ApplicationState) => state.carData);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(
        raceOrder,
        stateCarManifest,
        supportsCarData(eventInfo.raceloggerVersion) ? carNumberByCarIdx(carData) : undefined,
      ),
    );
  };
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars,
  );

  const carColors = assignCarColors(carInfo);
  const getColor = (carNum: string): string => carColors.get(carNum) ?? "black";

  // console.log(selectableCars);
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
    dispatch(stintRankingSettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, filterCarClasses: values }));
    }
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const newShowcars = selectableCars
        .filter((v) => selection.includes(v.carNum))
        .map((v) => v.carNum);
      const curSettings = { ...userSettings, showCars: newShowcars };
      dispatch(stintRankingSettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        const newGlobalShowCars = [...stateGlobalSettings.showCars];
        selection.forEach((item) => {
          if (!newGlobalShowCars.includes(item)) {
            newGlobalShowCars.push(item);
          }
        });
        if (newGlobalShowCars.length !== stateGlobalSettings.showCars.length) {
          dispatch(globalSettings({ ...stateGlobalSettings, showCars: newGlobalShowCars }));
        }
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  const getValue = (key: string) => {
    return getValueViaSpec(sInfo.data, manifestData, key);
  };
  // console.log(`user: ${userSettings.lowerRangeTime} ${userSettings.upperRangeTime}`);
  const currentSettings: IStintRankingSettings =
    globalWamp.currentLiveId != undefined
      ? { ...userSettings, lowerRangeTime: 0, upperRangeTime: getValue("sessionTime") }
      : userSettings;

  // console.log(`current ${currentSettings.lowerRangeTime} ${currentSettings.upperRangeTime}`);
  const combinedData = showCars.map((carNum) => {
    const computeAvgLap = (d: IStintInfo): number => {
      const currentCarLaps = carLaps.find((v) => v.carNum === carNum)!;
      const laps = stintLaps(d, currentCarLaps);
      const avg = laps.reduce((prev, cur) => prev + cur.lapTime, 0) / laps.length;
      return avg;
    };

    const carColor = (si: IStintInfo): string => getColor(carNum) ?? "black";
    return {
      carNum: carNum,
      data: getCombinedStintData(
        getCarStints(carStints, carNum).filter((v) =>
          isInSelectedRange(v, [currentSettings.lowerRangeTime, currentSettings.upperRangeTime]),
        ),
        [], // don't need pitstops here, was: getCarPitStops(carPits, carNum),
        carColor,
        computeAvgLap,
      ),
    };
  });
  const combinedDataMinMax = combinedData
    .flatMap((a) => [...a.data])
    .reduce(
      (a, b) => {
        return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
      },
      { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 },
    );

  const handleSliderChange = (value: [number, number]) => {
    dispatch(
      stintRankingSettings({ ...userSettings, lowerRangeTime: value[0], upperRangeTime: value[1] }),
    );
  };

  const width = 880;
  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
      </Row>
      {userSettings.showCars.length > 0 ? (
        <>
          <Divider />
          <Row>
            <StintRankingSvg
              height={400}
              width={width}
              combinedStintData={combinedData}
              {...combinedDataMinMax}
              showCars={showCars}
            />
          </Row>
          {globalWamp.currentLiveId === undefined ? (
            <>
              <Row justify="center">
                <Col span={22}>
                  <Slider
                    tooltip={{ formatter: (d) => secAsHHMMSS(d!) }}
                    min={userSettings.minSessionTime}
                    max={userSettings.maxSessionTime}
                    defaultValue={[userSettings.lowerRangeTime, userSettings.upperRangeTime]}
                    range={{ draggableTrack: true }}
                    onAfterChange={handleSliderChange}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
