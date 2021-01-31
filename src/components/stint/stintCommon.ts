import { IRaceContainer } from "../../stores/raceevents/types";
import { ILaptimeExtended } from "../../stores/types/laptimes";
import { IStintData } from "../../stores/types/stints";

export interface IStintCompareProps {
  reference: IStintData;
  other: IStintData;
  raceContainer: IRaceContainer;
  filterLaps: boolean;
}

export const ignoreLap = (d: ILaptimeExtended) => d.lapData.incomplete || d.lapData.outLap || d.lapData.incomplete;
