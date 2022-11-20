import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection } from "autobahn";
import { Config } from "../api/config";
import { API_CROSSBAR_URL, API_GRAPHQL_URL } from "../constants";
import { ReplayDataHolder } from "../processor/ReplayDataHolder";
import { SpeedmapDataHolder } from "../processor/SpeedmapDataHolder";

interface IGlobalWamp {
  currentLiveId?: string;
  replayId?: string; // is set if data was loaded for replay
  conn?: Connection;
  processor?: BulkProcessor;
  currentData?: IProcessRaceStateData;
  replayHolder?: ReplayDataHolder;
  speedmapHolder?: SpeedmapDataHolder;
  backendConfig: Config;
}

export const globalWamp: IGlobalWamp = {
  backendConfig: {
    crossbar: { url: API_CROSSBAR_URL ?? "API_CROSSBAR_URL", realm: "racelog" },
    graphql: { url: API_GRAPHQL_URL ?? "API_GRAPHQL_URL" },
  },
};
