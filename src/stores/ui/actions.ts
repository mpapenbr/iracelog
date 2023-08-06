import { actionCreatorFactory } from "typescript-fsa";
import {
  ICircleOfDoomSettings,
  IClassificationSettings,
  IDashboardSettings,
  IDriverLapsSettings,
  IDriverStintsSettings,
  IGlobalSettings,
  IMessagesSettings,
  IPitstopsSettings,
  IRaceGraphRelativeSettings,
  IRaceGraphSettings,
  IRacePositionsSettings,
  IReplaySettings,
  IStandingsColumns,
  IStintRankingSettings,
  IStintsSettings,
  IStintSummarySettings,
  IStrategySettings,
} from "./types";

// new actions start here
const actionCreator = actionCreatorFactory("UI");

export const classificationSettings =
  actionCreator<IClassificationSettings>("CLASSIFICATION_SETTINGS");
export const messagesSettings = actionCreator<IMessagesSettings>("MESSAGES_SETTINGS");
export const raceGraphSettings = actionCreator<IRaceGraphSettings>("RACEGRAPH_SETTINGS");
export const raceGraphRelativeSettings = actionCreator<IRaceGraphRelativeSettings>(
  "RACEGRAPH_RELATIVE_SETTINGS",
);
export const racePositionsSettings =
  actionCreator<IRacePositionsSettings>("RACEPOSITIONS_SETTINGS");
export const driverLapsSettings = actionCreator<IDriverLapsSettings>("DRIVERLAPS_SETTINGS");
export const pitstopsSettings = actionCreator<IPitstopsSettings>("PITSTOPS_SETTINGS");
export const stintsSettings = actionCreator<IStintsSettings>("STINTS_SETTINGS");
export const stintSummarySettings = actionCreator<IStintSummarySettings>("STINT_SUMMARY_SETTINGS");
export const dashboardSettings = actionCreator<IDashboardSettings>("DASHBOARD_SETTINGS");
export const strategySettings = actionCreator<IStrategySettings>("STRATEGY_SETTINGS");
export const driverStintsSettings = actionCreator<IDriverStintsSettings>("DRIVER_STINTS_SETTINGS");
export const stintRankingSettings = actionCreator<IStintRankingSettings>("STINT_RANKING_SETTINGS");
export const circleOfDoomSettings = actionCreator<ICircleOfDoomSettings>("CIRCLE_OF_DOOM_SETTINGS");

export const replaySettings = actionCreator<IReplaySettings>("REPLAY_SETTINGS");
export const globalSettings = actionCreator<IGlobalSettings>("GLOBAL_SETTINGS");
export const demoSettings = actionCreator<number>("DEMO_SETTINGS");

export const updateAvailableStandingsColumns = actionCreator<IStandingsColumns>(
  "UPDATE_AVAILABLE_STANDING_COLUMNS",
);

// TODO: rethink if saga would be better mechanism to distribute selections
export const sagaPitstopsSettings = actionCreator<IPitstopsSettings>("SAGA_PITSTOPS_SETTINGS");
export const sagaStintsSettings = actionCreator<IStintsSettings>("SAGA_STINTS_SETTINGS");
