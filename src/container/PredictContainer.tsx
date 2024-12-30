import { Button, Col, Divider, Empty, Radio, RadioChangeEvent, Row, Select, Slider } from "antd";
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
  updateLaptimeSelector,
  updatePredictPoint,
  updatePredictRace,
  updatePredictShowRange,
} from "../stores/grpc/slices/userSettingsSlice";

import {
  PredictParam,
  PredictParamSchema,
  PredictResult,
  PredictResultSchema,
  StintPart,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import {
  LaptimeSelector,
  PredictService,
} from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_service_pb";
import { RaceStateService } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/racestate/v1/racestate_service_pb";
import { create, toJsonString } from "@bufbuild/protobuf";
import { Duration, DurationSchema } from "@bufbuild/protobuf/wkt";
import _ from "lodash";
import PredictRaceC from "../components/predict/predictC";
import ShowPredictParam from "../components/predict/predictParam";
import {
  mergePredictData,
  PredictData,
  setRaceLeaderResult,
} from "../stores/grpc/slices/predictSlice";
import { predictDataSorter } from "../utils/sorter";
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
    if (predict.raceLeader.carNum == "") {
      console.log("useEffect - no leader data");
      currentLeaderCarNum(userSettings.selectTime).then((leaderCarNum) => {
        getPredictData(leaderCarNum, userSettings.selectTime).then((leaderData) => {
          console.log(
            `leaderCarNum: ${leaderCarNum}\nparam: ${toJsonString(PredictParamSchema, leaderData.p)}\nresult: ${toJsonString(
              PredictResultSchema,
              leaderData.r,
            )}`,
          );
          dispatch(mergePredictData(leaderData));
          dispatch(setRaceLeaderResult(leaderData));
        });
      });
    }
    updateWidth(); // Set initial width

    window.addEventListener("resize", updateWidth); // Update width on resize

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Use containerWidth as needed in your component
  // console.log(containerWidth); // For demonstration, logs the current container width
  // console.log(predict.resultByCarNum);
  const inputData: InputData = {
    stateGlobalSettings: stateGlobalSettings,
    pageFilterSettings: userSettings,
    autoFillCars: false,
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
    onSelectCarFilter: async (selection: string[]) => {
      const curSettings = { ...userSettings, showCars: selection };
      dispatch(updatePredictRace(curSettings));
      if (stateGlobalSettings.syncSelection) {
        dispatch(updateGlobalSettings({ ...stateGlobalSettings, showCars: selection }));
      }
      console.log(selection);
      if (globalWamp.currentLiveId === undefined) {
        collectData(userSettings.selectTime, predict.raceLeader.carNum, selection);
      } else {
        collectData(sessionData.session.sessionTime, predict.raceLeader.carNum, selection);
      }
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

  const currentLeaderCarNum = async (sessionTime: number): Promise<string> => {
    if (globalWamp.currentLiveId === undefined) {
      return currentLeaderCarNumStored(sessionTime);
    } else {
      return currentLeaderCarNumLive();
    }
  };
  const currentLeaderCarNumLive = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      resolve(raceOrder[0]);
    });
  };

  const currentLeaderCarNumStored = async (sessionTime: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      cbStatesService.getStates(
        {
          event: { arg: { case: "key", value: eventInfo.event.key } },
          start: { arg: { case: "sessionTime", value: sessionTime } },
          num: 1,
        },

        (err, res) => {
          if (err != undefined) {
            console.log(err);
            reject(err);
            return;
          }
          console.log(res);
          const carNum = byIdxLookup.carNum[res.states[0].cars[0].carIdx];
          resolve(carNum);
        },
      );
    });
  };

  const getPredictParam = async (
    carNum: string,
    sessionTime: number,
    laptimeSelector?: LaptimeSelector,
  ): Promise<PredictParam> => {
    if (globalWamp.currentLiveId === undefined) {
      return getPredictParamStored(carNum, sessionTime, laptimeSelector);
    } else {
      return getPredictParamLive(carNum, laptimeSelector);
    }
  };

  const getPredictParamLive = async (
    carNum: string,
    laptimeSelector?: LaptimeSelector,
  ): Promise<PredictParam> => {
    return new Promise((resolve, reject) => {
      cbPredictService.getLivePredictParam(
        {
          eventSelector: { arg: { case: "key", value: eventInfo.event.key } },
          carNum: carNum,
          laptimeSelector: laptimeSelector ?? userSettings.laptimeSelector,
        },
        (err, res) => {
          if (err != undefined) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(res.param!);
        },
      );
    });
  };
  const getPredictParamStored = async (
    carNum: string,
    sessionTime: number,
    laptimeSelector?: LaptimeSelector,
  ): Promise<PredictParam> => {
    return new Promise((resolve, reject) => {
      cbPredictService.getPredictParam(
        {
          eventSelector: { arg: { case: "key", value: eventInfo.event.key } },
          startSelector: { arg: { case: "sessionTime", value: sessionTime } },
          carNum: carNum,
          laptimeSelector: laptimeSelector ?? userSettings.laptimeSelector,
        },
        (err, res) => {
          if (err != undefined) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(res.param!);
        },
      );
    });
  };

  const getPredictResult = async (
    carNum: string,
    param: PredictParam,
  ): Promise<{ carNum: string; result: PredictResult }> => {
    return new Promise((resolve, reject) => {
      cbPredictService.predictRace(
        {
          param: param,
        },
        (err, res) => {
          if (err != undefined) {
            console.log(err);
            reject(err);
            return;
          }
          resolve({ carNum: carNum, result: res.result! });
        },
      );
    });
  };

  const getPredictData = async (
    carNum: string,
    sessionTime: number,
    laptimeSelector?: LaptimeSelector,
  ): Promise<PredictData> => {
    return new Promise((resolve, reject) => {
      getPredictParam(carNum, sessionTime, laptimeSelector)
        .then((param) => {
          getPredictResult(carNum, param).then((r) => {
            resolve({ carNum: carNum, p: param, r: r.result });
          });
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };

  const handleSliderChange = async (value: number) => {
    console.log("changed");
    const leaderCarNum = await currentLeaderCarNum(value);
    await collectData(value, leaderCarNum, props.selectedCars);
    dispatch(updatePredictPoint(value));
  };

  const collectData = async (
    sessionTime: number,
    leaderCarNum: string,
    carNums: string[],
    laptimeSelector?: LaptimeSelector,
  ) => {
    // const leaderParam = await getPredictParam(leaderCarNum, value);
    // const leaderResult = await getPredictResult(leaderParam);
    const leaderData = await getPredictData(leaderCarNum, sessionTime, laptimeSelector);
    console.log(
      `leaderCarNum: ${leaderCarNum}\nparam: ${toJsonString(PredictParamSchema, leaderData.p)}\nresult: ${toJsonString(
        PredictResultSchema,
        leaderData.r,
      )}`,
    );
    let allResults = [leaderData];
    // console.log(
    //   `leaderCarNum: ${leaderCarNum}\nparam: ${toJsonString(PredictParamSchema, leaderParam)}\nresult: ${toJsonString(PredictResultSchema, leaderResult)}`,
    // );
    const toNumber = (d: Duration) => Number(d.seconds) + Number(d.nanos) / 1e9;
    let carDataPromises = carNums.map((carNum) =>
      getPredictData(carNum, sessionTime, laptimeSelector),
    );
    let carDataResults = await Promise.all(carDataPromises);
    allResults = allResults.concat(carDataResults);
    allResults.sort(predictDataSorter);
    allResults.forEach((carData) => {
      const lp = _.last(carData.r.parts);
      console.log(
        `carNum: ${carData.carNum} laps: ${(lp?.partType.value as StintPart).lapEnd} time: ${toNumber(lp?.end!)}`,
      );
    });

    // now we know which of the selected cars + leader will finish first.
    // lets recalc based on leaders finish duration
    const lData = allResults[0];
    // dispatch(mergePredictData(lData));
    // dispatch(setRaceLeaderResult(lData));
    const lEnd = _.last(lData.r?.parts)?.end!;
    const lStart = lData.p?.race?.session!;
    const leaderRaceDuration = create(DurationSchema, {
      seconds: lEnd.seconds - lStart.seconds,
    });
    const recalcCarDataPromises = allResults
      .filter((a) => a.carNum != lData.carNum)
      .map((c) => {
        let recalc = create(PredictParamSchema, { ...c.p });
        recalc.race!.duration = leaderRaceDuration;
        return new Promise<PredictData>((resolve, reject) => {
          getPredictResult(c.carNum, recalc)
            .then((r) => {
              resolve({ carNum: c.carNum, p: recalc, r: r.result });
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        });
      });
    const recalcCarDataResults = await Promise.all(recalcCarDataPromises);
    console.log("recalc");
    recalcCarDataResults.concat(lData).forEach((carData) => {
      const lp = _.last(carData.r.parts);
      console.log(
        `carNum: ${carData.carNum} laps: ${(lp?.partType.value as StintPart).lapEnd} time: ${toNumber(lp?.end!)}`,
      );
      dispatch(mergePredictData(carData));
      if (carData.carNum == leaderCarNum) {
        dispatch(setRaceLeaderResult(carData));
      }
    });

    const longestRacer = recalcCarDataResults.concat(lData).reduce((prev, cur) => {
      const l = _.last(cur.r.parts);
      const val = toNumber(l?.end!);
      return val > prev ? val : prev;
    }, 0);
    console.log(`longest racer: ${longestRacer}`);
    dispatch(updatePredictShowRange({ min: sessionTime, max: longestRacer }));
  };

  const handleLaptimeSelector = (e: RadioChangeEvent) => {
    dispatch(updateLaptimeSelector(e.target.value));
    collectData(
      userSettings.selectTime,
      predict.raceLeader.carNum,
      props.selectedCars,
      e.target.value,
    );
  };

  const displayTimeFromSettings = hocDisplayTimeByUserSettings(
    sessionData,
    stateGlobalSettings.timeMode,
  );
  const width = containerWidth;

  let work = props.selectedCars;
  if (!work.includes(predict.raceLeader.carNum)) {
    work = work.concat(predict.raceLeader.carNum);
  }
  const showPredicts = work
    .filter((item) => predict.byCarNum[item])
    .map((carNum) => predict.byCarNum[carNum])
    .sort(predictDataSorter)
    .map((item) => item.carNum);

  return (
    <div ref={containerRef}>
      <Row gutter={16}>
        <MultiSelectCarFilter {...props} />
      </Row>
      {userSettings.showCars.length > -1 ? (
        <>
          <Divider />
          {globalWamp.currentLiveId === undefined ? (
            <>
              <Row justify="center">
                <Col span={22}>
                  <Slider
                    tooltip={{ formatter: (d) => displayTimeFromSettings(d!) }}
                    min={userSettings.minSessionTime}
                    max={userSettings.maxSessionTime}
                    defaultValue={userSettings.selectTime}
                    range={false}
                    onChangeComplete={handleSliderChange}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <></>
          )}
          <Row>
            <Col span={22}>
              {showPredicts.map((carNum) => (
                <PredictRaceC
                  // height={400}
                  width={width}
                  carNum={carNum}
                  showCarNum={true}
                  minTime={userSettings.lowerRangeTime}
                  maxTime={userSettings.upperRangeTime}
                />
              ))}
            </Col>
          </Row>
          {/* <Row>
            <Col span={22}>
              <PredictRaceB
                // height={400}
                width={width}
                minTime={userSettings.minSessionTime}
                maxTime={userSettings.maxSessionTime}
                showCars={props.selectedCars}
                hightlightCars={props.highlightCars}
                toggleHighlightCar={props.toggleHighlightCar}
              />
            </Col>
          </Row> */}
          <Row>
            <Col span={4}>
              <h3>Race prediction</h3>
            </Col>
            <Col span={12}>
              <Radio.Group
                defaultValue={userSettings.laptimeSelector}
                onChange={handleLaptimeSelector}
              >
                <Radio.Button value={LaptimeSelector.PREVIOUS_STINT_AVG}>
                  Prev stint avg
                </Radio.Button>
                <Radio.Button value={LaptimeSelector.CURRENT_STINT_AVG}>Cur stint avg</Radio.Button>
                <Radio.Button value={LaptimeSelector.LAST}>last lap</Radio.Button>
              </Radio.Group>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  const sTime =
                    globalWamp.currentLiveId === undefined
                      ? userSettings.selectTime
                      : sessionData.session.sessionTime;
                  handleSliderChange(sTime);
                }}
              >
                Refresh
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={22}>
              <ShowPredictParam
                // height={400}
                width={width}
                showCars={props.selectedCars}
                hightlightCars={props.highlightCars}
                toggleHighlightCar={props.toggleHighlightCar}
              />
            </Col>
          </Row>
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
};
