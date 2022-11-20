export interface ISpeedmap {
  speedmapData: ISpeedmapData;
  speedmapEvolution: ISpeedmapEvolution[];
}

interface ISpeedmapBaseData {
  chunkSize: number;
  trackLength: number;
  sessionTime: number;
  timeOfDay: number;
  trackTemp: number;
}
export interface ISpeedmapData extends ISpeedmapBaseData {
  data: ICarClassData;
}
export interface ISpeedmapEvolution extends ISpeedmapBaseData {
  laptimes: ICarClassLaptimes;
}

export interface ICarClassData {
  [key: string]: {
    chunkSpeeds: number[];
    laptime: number;
  };
}
export interface ICarClassLaptimes {
  [key: string]: number;
}

export const initialSpeedmapData: ISpeedmapData = {
  chunkSize: 0,
  trackLength: 0,
  sessionTime: 0,
  timeOfDay: 0,
  trackTemp: 0,
  data: {},
};
export const initialSpeedmap: ISpeedmap = {
  speedmapData: initialSpeedmapData,
  speedmapEvolution: [],
};
