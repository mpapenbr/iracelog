import { BulkProcessor } from "@mpapenbr/iracelog-analysis";
import { Connection } from "autobahn";

interface IGlobalWamp {
  currentLiveId?: string;
  conn?: Connection;
  processor?: BulkProcessor;
}

export const globalWamp: IGlobalWamp = {};
