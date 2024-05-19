import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Connection } from "autobahn";
import { Config } from "../api/config";
import { API_CROSSBAR_URL, API_GRAPHQL_URL } from "../constants";
import { ReplayDataHolder } from "../processor/ReplayDataHolder";
import { SpeedmapDataHolder } from "../processor/SpeedmapDataHolder";

type CancelFn = () => void;
export type StreamContainer = {
  analysis: CancelFn;
  live: CancelFn;
  driverData: CancelFn;
  speedmap: CancelFn;
};
export const closeStreams = (container?: StreamContainer) => {
  if (container === undefined) {
    return;
  }
  if (container.live !== undefined) {
    console.log("closing live connection");
    container.live();
  }
  if (container.analysis !== undefined) {
    console.log("closing analysis connection");
    container.analysis();
  }
  if (container.driverData !== undefined) {
    console.log("closing driver data connection");
    container.driverData();
  }
  if (container.speedmap !== undefined) {
    console.log("closing speedmap data connection");
    container.speedmap();
  }
};

interface IGlobalWamp {
  currentLiveId?: string;
  replayId?: string; // is set if data was loaded for replay
  replayHolder?: ReplayDataHolder;
  speedmapHolder?: SpeedmapDataHolder;
  backendConfig: Config;
  streamContainer?: StreamContainer;
  // @deprecated
  conn?: Connection;
  // @deprecated
  processor?: BulkProcessor;
  // @deprecated
  currentData?: IProcessRaceStateData;
}

export const globalWamp: IGlobalWamp = {
  backendConfig: {
    crossbar: { url: API_CROSSBAR_URL ?? "API_CROSSBAR_URL", realm: "racelog" },
    graphql: { url: API_GRAPHQL_URL ?? "API_GRAPHQL_URL" },
  },
};
