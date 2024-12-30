import { Duration } from "@bufbuild/protobuf/wkt";

export const durToSec = (dur: Duration): number => {
  return Number(dur.seconds) + dur.nanos / 1e9;
};
