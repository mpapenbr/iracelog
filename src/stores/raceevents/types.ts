export interface IRaceEvent {
  id: string;
  name: string;
  trackName: string;
  lastModified: Date;
}

const defaultRaceEvent: IRaceEvent = {
  id: "",
  name: "",
  trackName: "",
  lastModified: new Date(),
};

export interface IRaceEventsState {
  readonly data: IRaceEvent[];
}
