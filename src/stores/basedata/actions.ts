import actionCreatorFactory from "typescript-fsa";
import { IColumnInfo } from "../ui/types";

// *INFO* Not sure if this stays. Maybe it's a better idea to have them in RaceData

const actionCreator = actionCreatorFactory("BASE_DATA");

export const updateAvailableStandingsColumns = actionCreator<IColumnInfo[]>("UPDATE_AVAILABLE_STANDING_COLUMNS");
