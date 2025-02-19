import { Config } from "../api/config";
import { API_GRAPHQL_URL, API_GRPC_URL } from "../constants";
import { ReplayDataHolder } from "../processor/ReplayDataHolder";
import { SpeedmapDataHolder } from "../processor/SpeedmapDataHolder";

type CancelFn = () => void;
export type StreamContainer = {
  analysis: CancelFn;
  live: CancelFn;
  driverData: CancelFn;
  speedmap: CancelFn;
  snapshot: CancelFn;
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
  if (container.snapshot !== undefined) {
    console.log("closing snapshot data connection");
    container.snapshot();
  }
};

interface IGlobalWamp {
  currentLiveId?: string;
  replayId?: string; // is set if data was loaded for replay
  replayHolder?: ReplayDataHolder;
  speedmapHolder?: SpeedmapDataHolder;
  backendConfig: Config;
  streamContainer?: StreamContainer;
}

export const globalWamp: IGlobalWamp = {
  backendConfig: {
    graphql: { url: API_GRAPHQL_URL ?? "API_GRAPHQL_URL" },
    grpc: { url: API_GRPC_URL ?? "API_GRPC_URL" },
    tenant: { id: "API_TENANT_ID" },
  },
};
