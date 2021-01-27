export interface IDriver {
  carIdx: number;
  carId: number;
  carClassId: number;
  carClassShortName: string;
  carNumber: number;
  carNumberRaw: string;
  carName: string;
  userId: number;
  userName: string;
  teamId: number;
  teamName: string;
  iRating: number;
}

export interface IDriverMeta {
  id: string;
  sessionNum: number;
  sessionTime: number;
  sessionTick: number;
  raceEventId: string;
  data: IDriver;
}

export const defaultDriverData = (): IDriver => ({
  carIdx: 0,
  carId: 0,
  carClassId: 0,
  carClassShortName: "",
  carNumber: 0,
  carNumberRaw: "",
  carName: "",
  userId: 0,
  userName: "",
  teamId: 0,
  teamName: "",
  iRating: 0,
});

export const defaultDriverMeta: IDriverMeta = {
  id: "",
  sessionNum: 0,
  sessionTime: 0,
  sessionTick: 0,
  raceEventId: "",

  data: defaultDriverData(),
};

export interface IEventDriverState {
  readonly data: IDriverMeta[];
}
