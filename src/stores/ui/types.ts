export interface IUiStints {
  stintNo: number;
}
export interface IUiEntries {
  entryDetails: number;
}
export interface IUiData {
  stint: IUiStints;
  entries: IUiEntries;
}

export const defaultUiData: IUiData = {
  stint: { stintNo: 0 },
  entries: { entryDetails: -1 },
};
export interface IUiState {
  readonly data: IUiData;
}
