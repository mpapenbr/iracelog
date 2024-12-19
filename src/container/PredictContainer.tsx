import { Col, Divider, Empty, Row, Select, Slider } from "antd";
import * as React from "react";
import { globalWamp } from "../commons/globals";
import { assignCarColors } from "../components/live/colorAssignment";
import MultiSelectCarFilter from "../components/live/multiCarSelectFilter";
import { hocDisplayTimeByUserSettings } from "../components/live/util";
import { useAppDispatch, useAppSelector } from "../stores";
import { IMultiCarSelectFilterSettings, IPredictRaceSettings } from "../stores/grpc/slices/types";
import {
  toggleHighlightCar,
  updateGlobalSettings,
  updatePredictPoint,
  updatePredictRace,
} from "../stores/grpc/slices/userSettingsSlice";

import {
  PredictParamSchema,
  PredictResultSchema,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import { PredictService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_service_pb";
import { RaceStateService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_service_pb";
import { create, toJsonString } from "@bufbuild/protobuf";
import { DurationSchema } from "@bufbuild/protobuf/wkt";
import _ from "lodash";
import PredictRace from "../components/predict/predict";
import { mergePredictResult, setRaceLeaderResult } from "../stores/grpc/slices/predictSlice";
import { useClient } from "../utils/useClient";
import { InputData, prepareFilterData } from "./multiCarSelectFilterHelper";

const { Option } = Select;

export const PredictContainer: React.FC = () => {
  const availableCars = useAppSelector((state) => state.availableCars);
  const carClasses = useAppSelector((state) => state.carClasses);
  const userSettings = useAppSelector((state) => state.userSettings.predictRace);
  const stateGlobalSettings = useAppSelector((state) => state.userSettings.global);
  const raceOrder = useAppSelector((state) => state.raceOrder);
  const carLaps = useAppSelector((state) => state.carLaps);
  const carStints = useAppSelector((state) => state.carStints);
  const sessionData = useAppSelector((state) => state.session);
  const eventInfo = useAppSelector((state) => state.eventInfo);
  const byIdxLookup = useAppSelector((state) => state.byIdxLookup);
  const predict = useAppSelector((state) => state.predict);
  const dispatch = useAppDispatch();

  // containerWidth state and ref (copilot proposal)
  const containerRef = React.useRef<HTMLDivElement>(null); // Step 1: Create a ref for the container
  const [containerWidth, setContainerWidth] = React.useState(0); // Step 2: Initialize state for the container's width

  const cbPredictService = useClient(PredictService);
  const cbStatesService = useClient(RaceStateService);
  React.useEffect(() => {
    const updateWidth = () => {
      // Check if the container ref is current and update the width
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth(); // Set initial width

    window.addEventListener("resize", updateWidth); // Update width on resize

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Use containerWidth as needed in your component
  // console.log(containerWidth); // For demonstration, logs the current container width
  console.log(predict.byCarNum);
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
      dispatch(updatePredictRace(curSettings));
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
      dispatch(updatePredictRace(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
      console.log(selection);
    },
    highlightCars: stateGlobalSettings.highlightCars,
    toggleHighlightCar: (carNum: string) => {
      dispatch(toggleHighlightCar(carNum));
    },
  };

  const carColors = assignCarColors(availableCars);
  const getColor = (carNum: string): string => carColors.get(carNum) ?? "black";

  // console.log(`user: ${userSettings.lowerRangeTime} ${userSettings.upperRangeTime}`);
  const currentSettings: IPredictRaceSettings =
    globalWamp.currentLiveId != undefined ? { ...userSettings } : userSettings;

  // console.log(`current ${currentSettings.lowerRangeTime} ${currentSettings.upperRangeTime}`);

  const handleSliderChange = (value: number) => {
    console.log("changed");
    cbStatesService.getStates(
      {
        event: { arg: { case: "key", value: eventInfo.event.key } },
        start: { arg: { case: "sessionTime", value: value } },
        num: 1,
      },

      (err, res) => {
        if (err != undefined) {
          console.log(err);
          return;
        }
        console.log(res);
        const carNum = byIdxLookup.carNum[res.states[0].cars[0].carIdx];
        console.log(carNum);
        cbPredictService.getPredictParam(
          {
            eventSelector: { arg: { case: "key", value: eventInfo.event.key } },
            startSelector: { arg: { case: "sessionTime", value: value } },
            carNum: carNum,
          },
          (err, res) => {
            if (err != undefined) {
              console.log(err);
              return;
            }
            cbPredictService.predictRace(
              {
                param: res.param,
              },
              (err, leaderResult) => {
                if (err != undefined) {
                  console.log(err);
                  return;
                }
                console.log(leaderResult);
                console.log(
                  "Prediction for leader " +
                    toJsonString(PredictResultSchema, leaderResult.result!),
                );
                const lEnd = _.last(leaderResult.result?.parts)?.end!;
                const lStart = res.param?.race?.session!;

                // const leaderRaceDuration = Number(lEnd.seconds - lStart.seconds)
                const leaderRaceDuration = create(DurationSchema, {
                  seconds: lEnd.seconds - lStart.seconds,
                });

                console.log("Leader raceDur: ", lEnd.seconds - lStart.seconds);
                dispatch(setRaceLeaderResult(leaderResult.result!));
                props.selectedCars.forEach((selCarNum) => {
                  cbPredictService.getPredictParam(
                    {
                      eventSelector: { arg: { case: "key", value: eventInfo.event.key } },
                      startSelector: { arg: { case: "sessionTime", value: value } },
                      carNum: selCarNum,
                    },
                    (err, carRes) => {
                      if (err != undefined) {
                        console.log(err);
                        return;
                      }
                      carRes.param!.race!.duration = leaderRaceDuration;
                      console.log(
                        "carNum: " +
                          selCarNum +
                          " " +
                          toJsonString(PredictParamSchema, carRes.param!),
                      );

                      cbPredictService.predictRace(
                        {
                          param: carRes.param,
                        },
                        (err, res) => {
                          if (err != undefined) {
                            console.log(err);
                            return;
                          }
                          dispatch(mergePredictResult({ carNum: selCarNum, result: res.result! }));
                          console.log(res);
                        },
                      );
                    },
                  );
                });
              },
            );
          },
        );
      },
    );
    dispatch(updatePredictPoint(value));
  };

  const displayTimeFromSettings = hocDisplayTimeByUserSettings(
    sessionData,
    stateGlobalSettings.timeMode,
  );
  const width = containerWidth;
  return (
    <div ref={containerRef}>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
      </Row>
      {userSettings.showCars.length > -1 ? (
        <>
          <Divider />
          <Row>
            <PredictRace
              height={800}
              width={width}
              minTime={userSettings.minSessionTime}
              maxTime={userSettings.maxSessionTime}
              showCars={props.selectedCars}
              hightlightCars={props.highlightCars}
              toggleHighlightCar={props.toggleHighlightCar}
            />
          </Row>
          {globalWamp.currentLiveId === undefined ? (
            <>
              <Row justify="center">
                <Col span={22}>
                  <Slider
                    tooltip={{ formatter: (d) => displayTimeFromSettings(d!) }}
                    min={userSettings.minSessionTime}
                    max={userSettings.maxSessionTime}
                    defaultValue={(userSettings.maxSessionTime - userSettings.minSessionTime) / 2}
                    range={false}
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
    </div>
  );
};
