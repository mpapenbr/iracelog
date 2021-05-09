import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection } from "autobahn";

interface IGlobalWamp {
  currentLiveId?: string;
  conn?: Connection;
  processor?: BulkProcessor;
  currentData?: IProcessRaceStateData;
}

export const globalWamp: IGlobalWamp = {};
