export interface ICarInfoContainer {
  cars: ICarInfo[];
  carClasses: ICarClass[];
  entries: IEntry[];
}

export interface ICarInfo {
  carId: number;
  carClassId: number;
  name: string;
  nameShort: string;
  carClassName: string;
  fuelPct: number;
  powerAdjust: number;
  weightPenalty: number;
}

export interface ICarClass {
  id: number;
  name: string;
}

export interface IEntry {
  car: ICarEntry;
  team: ITeamEntry;
  drivers: IDriverEntry;
}

export interface ICarEntry {
  name: string;
  carId: number;
  carIdx: number;
  carClassId: number;
  carNumber: string;
  carNumberRaw: number;
}
export interface ITeamEntry {
  id: number;
  name: string;
  carIdx: number;
}
export interface IDriverEntry {
  id: number;
  carIdx: number;
  name: string;
  abbrevName: string;
  iRating: number;
  initials: string;
  licLevel: number;
  licSubLevel: number;
  licString: string;
}

export const initialCarInfoContainer: ICarInfoContainer = { cars: [], carClasses: [], entries: [] };
