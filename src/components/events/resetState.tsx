import { Dispatch } from "redux";
import { resetAvailableCars } from "../../stores/grpc/slices/availableCarsSlice";
import { resetCarClasses } from "../../stores/grpc/slices/carClassesSlice";
import { resetCarEntries } from "../../stores/grpc/slices/carEntrySlice";
import { resetCarInfo } from "../../stores/grpc/slices/carInfoSlice";
import { resetCarLaps } from "../../stores/grpc/slices/carLapsSlice";
import { resetByIdxLookup } from "../../stores/grpc/slices/carNumByIdxSlice";
import { resetCarOccupancy } from "../../stores/grpc/slices/carOccupancySlice";
import { resetCarPits } from "../../stores/grpc/slices/carPitsSlice";
import { resetCarStints } from "../../stores/grpc/slices/carStintsSlice";
import { resetEventInfo } from "../../stores/grpc/slices/eventInfoSlice";
import {
  resetCircleOfDoom,
  resetClassification,
  resetDashboard,
  resetDriverLaps,
  resetDriverStints,
  resetGlobalSettings,
  resetMessages,
  resetPits,
  resetRaceGraph,
  resetRaceGraphRelative,
  resetRacePositions,
  resetReplay,
  resetStandingsColumns,
  resetStintRankings,
  resetStintSummary,
  resetStints,
  resetStrategy,
} from "../../stores/grpc/slices/userSettingsSlice";

// import { initialReplaySettings } from "../../stores/ui/reducer";

export const resetUI = (dispatch: Dispatch) => {
  dispatch(resetGlobalSettings());
  dispatch(resetStandingsColumns());
  dispatch(resetClassification());
  dispatch(resetCircleOfDoom());
  dispatch(resetStrategy());
  dispatch(resetStints());
  dispatch(resetPits());
  dispatch(resetStintSummary());
  dispatch(resetDriverStints());
  dispatch(resetDriverLaps());
  dispatch(resetRaceGraph());
  dispatch(resetRaceGraphRelative());
  dispatch(resetRacePositions());
  dispatch(resetStintRankings());
  dispatch(resetDashboard());
  dispatch(resetReplay());
  dispatch(resetMessages());
};
export const resetData = (dispatch: Dispatch) => {
  dispatch(resetEventInfo());
  dispatch(resetCarClasses());
  dispatch(resetCarEntries());
  dispatch(resetCarInfo());
  dispatch(resetCarLaps());
  dispatch(resetCarOccupancy());
  dispatch(resetCarPits());
  dispatch(resetCarStints());
  dispatch(resetAvailableCars());
  dispatch(resetByIdxLookup());
};
