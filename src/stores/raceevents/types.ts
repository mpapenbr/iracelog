export interface IRaceEvent {
  id: string;
  name: string;
  trackNameShort: string;
  trackNameLong: string;
  lastModified: Date;
}

const defaultRaceEvent: IRaceEvent = {
  id: "",
  name: "",
  trackNameShort: "",
  trackNameLong: "",
  lastModified: new Date(),
};

export interface IRaceEventsState {
  readonly data: IRaceEvent[];
}
