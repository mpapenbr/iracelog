export interface CurrentCarOcc {
  carIdx: number;
  carNum: string;
  team: string;
  driver: string;
}

export interface CurrentCarOccState {
  sessionTime: number;
  carOcc: CurrentCarOcc[];
}
