export interface IUiStints {
  stintNo: number;
}
export interface IUiData {
  stint: IUiStints;
}

export const defaultUiData: IUiData = {
  stint: { stintNo: 0 },
};
export interface IUiState {
  readonly data: IUiData;
}
