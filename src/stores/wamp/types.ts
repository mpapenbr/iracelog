export interface IWamp {
  stintNo: number;
}
export interface ISession {
  simStart: number;
  timeRemain: number;
}

interface IDataEntrySpec {
  name: string;
  type: string;
  info?: string;
}

const SessionManifest: IDataEntrySpec[] = [{ name: "dings", type: "string" }];
export interface IWampData {
  connected: boolean;
  session: ISession;

  dummy: any;
}

export const defaultSession: ISession = {
  simStart: 0,
  timeRemain: 0,
};
export const defaultWampData: IWampData = {
  connected: false,
  session: defaultSession,
  dummy: "no content yet",
};
export interface IWampState {
  readonly data: IWampData;
}
