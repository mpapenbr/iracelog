import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Col, Divider, Empty, Row, Select, Slider } from "antd";
import * as React from "react";
import { globalWamp } from "../commons/globals";
import { assignCarColors } from "../components/live/colorAssignment";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { stintLaps } from "../components/live/statsutil";
import { getCarStints, isInSelectedRange } from "../components/live/util";
import { getCombinedStintData } from "../components/nivo/stintsummary/commons";
import StintRankingSvg from "../components/stintRanking/rankingSvg";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings } from "../stores/grpc/slices/types";
import { updateGlobalSettings, updateStintRankings } from "../stores/grpc/slices/userSettingsSlice";
import { IStintRankingSettings } from "../stores/ui/types";
import { secAsHHMMSS } from "../utils/output";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

const { Option } = Select;

export const StintRankingContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.stintRankings);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carStints = useAppSelector((state) => state.carStints);
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,
    autoFillCars: true,
    raceOrder: raceOrder,
    availableCars: availableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCallback: (arg: IMultiCarSelectFilterSettings) => {
      const curSettings = {
        ...userSettings,
        ...arg,
      };
      // const curSettings = { ...userSettings, filterCarClasses: values };
      dispatch(updateStintRankings(curSettings));
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
      dispatch(updateStintRankings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
    },
  };

  const carColors = assignCarColors(availableCars);
  const getColor = (carNum: string): string => carColors.get(carNum) ?? "black";

  // console.log(`user: ${userSettings.lowerRangeTime} ${userSettings.upperRangeTime}`);
  const currentSettings: IStintRankingSettings =
    globalWamp.currentLiveId != undefined
      ? { ...userSettings, lowerRangeTime: 0, upperRangeTime: session.sessionTime }
      : userSettings;

  // console.log(`current ${currentSettings.lowerRangeTime} ${currentSettings.upperRangeTime}`);
  const combinedData = props.selectedCars.map((carNum) => {
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

  const handleSliderChange = (value: number[]) => {
    dispatch(
      updateStintRankings({ ...userSettings, lowerRangeTime: value[0], upperRangeTime: value[1] }),
    );
  };

  const width = 880;
  return (
    <>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
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
              showCars={props.selectedCars}
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
                    onChangeComplete={handleSliderChange}
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
