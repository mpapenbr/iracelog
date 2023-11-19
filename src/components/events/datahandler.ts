import {
  ICarInfo,
  ICarLaps,
  ICarPitInfo,
  ICarStintInfo,
  IMessage,
  IProcessRaceStateData,
  IRaceGraph,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Dispatch } from "redux";
import { distributeChanges } from "../../processor/processData";
import { updateCarClasses, updateCarEntries, updateCarInfos } from "../../stores/cars/actions";
import {
  updateAvailableCarClasses,
  updateAvailableCars,
  updateCarInfo,
  updateCarLaps,
  updateCarPits,
  updateCarStints,
  updateClassification,
  updateInfoMessages,
  updateRaceGraph,
  updateSessionInfo,
} from "../../stores/racedata/actions";
import { ICarBaseData, ICarClass } from "../../stores/racedata/types";
import { updateSpeedmapData } from "../../stores/speedmap/actions";
import { initialSpeedmapData } from "../../stores/speedmap/types";
import {
  circleOfDoomSettings,
  classificationSettings,
  dashboardSettings,
  driverLapsSettings,
  driverStintsSettings,
  globalSettings,
  messagesSettings,
  pitstopsSettings,
  raceGraphRelativeSettings,
  raceGraphSettings,
  racePositionsSettings,
  replaySettings,
  stintRankingSettings,
  stintSummarySettings,
  stintsSettings,
  strategySettings,
  updateAvailableStandingsColumns,
} from "../../stores/ui/actions";
import { defaultStateData } from "../../stores/ui/reducer";

const onChangeSession = (dispatch: Dispatch, message: IMessage) => {
  // console.log(message);
  dispatch(updateSessionInfo(message));
};
const onChangeClassification = (dispatch: Dispatch, message: IMessage) => {
  // console.log(message);
  dispatch(updateClassification(message));
};

const onChangeInfoMessages = (dispatch: Dispatch, data: IMessage[]) => {
  console.log("onChangeInfoMessages: " + data.length);
  dispatch(updateInfoMessages(data));
};
const onChangedAvailableCars = (dispatch: Dispatch, data: ICarBaseData[]) => {
  console.log("onChangedAvailableCars: " + data.length);
  dispatch(updateAvailableCars(data));
};
const onChangedAvailableCarClasses = (dispatch: Dispatch, data: ICarClass[]) => {
  console.log("onChangedAvailableCarClasses: " + data.length);
  dispatch(updateAvailableCarClasses(data));
};

const onChangeCarInfos = (dispatch: Dispatch, data: ICarInfo[]) => {
  // console.log(message);
  dispatch(updateCarInfo(data));
};
const onChangeRaceGraph = (dispatch: Dispatch, data: IRaceGraph[]) => {
  console.log("onChangeRaceGraph: " + data.length);
  dispatch(updateRaceGraph(data));
};
const onChangeCarLaps = (dispatch: Dispatch, data: ICarLaps[]) => {
  // console.log(message);
  dispatch(updateCarLaps(data));
};
const onChangeCarStints = (dispatch: Dispatch, data: ICarStintInfo[]) => {
  // console.log("onChangeCarStints:" + data.length);
  dispatch(updateCarStints(data));
};
const onChangeCarPits = (dispatch: Dispatch, data: ICarPitInfo[]) => {
  // console.log(message);
  // console.log("onChangeCarPits:" + data.length);
  dispatch(updateCarPits(data));
};

export const resetUi = (dispatch: Dispatch) => {
  dispatch(classificationSettings(defaultStateData.classification));
  dispatch(messagesSettings(defaultStateData.messages));
  dispatch(raceGraphSettings(defaultStateData.raceGraph));
  dispatch(raceGraphRelativeSettings(defaultStateData.raceGraphRelative));
  dispatch(racePositionsSettings(defaultStateData.racePositions));
  dispatch(driverLapsSettings(defaultStateData.driverLaps));
  dispatch(pitstopsSettings(defaultStateData.pitstops));
  dispatch(stintsSettings(defaultStateData.stints));
  dispatch(stintSummarySettings(defaultStateData.stintSummary));
  dispatch(stintRankingSettings(defaultStateData.stintRanking));
  dispatch(driverStintsSettings(defaultStateData.driverStints));
  dispatch(circleOfDoomSettings(defaultStateData.circleOfDoom));
  dispatch(replaySettings(defaultStateData.replay));
  dispatch(globalSettings(defaultStateData.global));
  dispatch(dashboardSettings(defaultStateData.dashboard));
  dispatch(strategySettings(defaultStateData.strategy));

  dispatch(updateAvailableStandingsColumns(defaultStateData.standingsColumns));
  dispatch(updateAvailableCars([]));
  dispatch(updateAvailableCarClasses([]));
  dispatch(updateSpeedmapData(initialSpeedmapData));
  dispatch(updateCarInfos([]));
  dispatch(updateCarClasses([]));
  dispatch(updateCarEntries([]));
};
// if legacy is true, we use the data from carInfo to update the available cars/classes.
// nowadays this is done by processCarData
export const doDistribute = (
  dispatch: Dispatch,
  currentData: IProcessRaceStateData,
  newData: IProcessRaceStateData,
  legacy?: boolean, //
) => {
  distributeChanges({
    currentData: currentData,
    newData: newData,
    onChangedSession: (arg) => onChangeSession(dispatch, arg),
    onChangedClassification: (arg) => onChangeClassification(dispatch, arg),
    onChangedAvailableCars:
      legacy ?? false ? (arg) => onChangedAvailableCars(dispatch, arg) : undefined,
    onChangedAvailableCarClasses:
      legacy ?? false ? (arg) => onChangedAvailableCarClasses(dispatch, arg) : undefined,
    onChangedRaceGraph: (arg) => onChangeRaceGraph(dispatch, arg),
    onChangedCarInfos: (arg) => onChangeCarInfos(dispatch, arg),
    onChangedCarLaps: (arg) => onChangeCarLaps(dispatch, arg),
    onChangedCarStints: (arg) => onChangeCarStints(dispatch, arg),
    onChangedCarPits: (arg) => onChangeCarPits(dispatch, arg),
    onChangedInfoMessages: (arg) => onChangeInfoMessages(dispatch, arg),
  });
};
