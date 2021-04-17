import { Connection } from "autobahn";

interface IGlobalWamp {
  currentLiveId?: string;
  conn?: Connection;
}

export const globalWamp: IGlobalWamp = {};
