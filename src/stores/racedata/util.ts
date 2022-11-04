import { IDataEntrySpec, IManifests } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { InboundManifests } from "./types";

export const postProcessManifest = (data: InboundManifests): IManifests => {
  const toDataSpec = (d: string[]): IDataEntrySpec[] => d.map((v) => ({ name: v, type: "string" }));
  return {
    car: toDataSpec(data.car),
    session: toDataSpec(data.session),
    message: toDataSpec(data.message),
    pit: [],
  };
};
