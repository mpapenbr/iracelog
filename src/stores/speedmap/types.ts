export interface ISpeedmap {
    speedmapData: ISpeedmapData
}

export interface ISpeedmapData {
    chunkSize: number,
    trackLength: number,
    data: ICarClassData,
}

export interface ICarClassData {
    [key: string]: number[]
}

export const initialSpeedmapData: ISpeedmapData = { chunkSize: 0, trackLength: 0, data: {} }
export const initialSpeedmap: ISpeedmap = { speedmapData: initialSpeedmapData }