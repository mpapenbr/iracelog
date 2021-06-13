import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection } from "autobahn";
import { ReplayDataHolder } from "../processor/ReplayDataHolder";

interface IGlobalWamp {
  currentLiveId?: string;
  replayId?: string; // is set if data was loaded for replay
  conn?: Connection;
  processor?: BulkProcessor;
  currentData?: IProcessRaceStateData;
  replayHolder?: ReplayDataHolder;
}

export const globalWamp: IGlobalWamp = {};
