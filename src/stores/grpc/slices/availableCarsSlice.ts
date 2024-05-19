import { CarOccupancy } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_occupancy_pb";
import { CarContainer } from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/car/v1/car_pb";
import {
  LiveAnalysisSelResponse,
  LiveDriverDataResponse,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/livedata/v1/live_service_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface ICarBaseData {
  carIdx: number;
  carNum: string;
  name: string;
  carClass: string;
  teamName: string;
  driverName: string;
}

const initialState = [] as ICarBaseData[];

export const availableCarsSlice = createSlice({
  name: "availableCars",
  initialState,
  reducers: {
    updateFromDriverData: (state, action: PayloadAction<LiveDriverDataResponse>) => {
      const liveDriverData = action.payload;

      const ret = handleUpdateFromDriverData(state, {
        carClasses: liveDriverData.carClasses,
        cars: liveDriverData.cars,
        entries: liveDriverData.entries,
        currentDrivers: liveDriverData.currentDrivers,
      });
      return ret;
    },
    updateFromCarContainer: (state, action: PayloadAction<CarContainer>) => {
      const liveDriverData = action.payload;

      const ret = handleUpdateFromDriverData(state, liveDriverData);
      return ret;
    },
    updateFromAnalysisData: (state, action: PayloadAction<LiveAnalysisSelResponse>) => {
      handleUpdateFromAnalysisData(state, action.payload.carOccupancies);
    },
    updateFromCarOccupancy: (state, action: PayloadAction<CarOccupancy[]>) => {
      handleUpdateFromAnalysisData(state, action.payload);
    },
    resetAvailableCars: () => {
      return initialState;
    },
  },
});

const handleUpdateFromDriverData = (current: ICarBaseData[], cc: CarContainer): ICarBaseData[] => {
  const currentDrivers = current.map((car) => ({ carNum: car.carNum, name: car.driverName }));
  const liveDriverData = cc;

  if (liveDriverData.entries.length != currentDrivers.length) {
    console.log(`change in driver count detected`);

    const cRef = Object.assign({}, ...liveDriverData.carClasses.map((e) => ({ [e.id]: e.name })));
    const newData = liveDriverData.entries.map((car) => ({
      carIdx: car.car?.carIdx!,
      driverName: liveDriverData.currentDrivers[car.car?.carIdx!],
      carNum: car.car?.carNumber!,
      teamName: car.team?.name ?? "",
      name: car.team?.name ?? "",
      carClass: cRef[car.car?.carClassId!] ?? "",
    }));
    // console.log(newData);
    return newData;
  } else {
    return current;
  }
};
const handleUpdateFromAnalysisData = (current: ICarBaseData[], cc: CarOccupancy[]) => {
  const currentDrivers = current.map((car) => ({ carNum: car.carNum, name: car.driverName }));
  const incoming = cc
    .map((car) => ({
      carNum: car.carNum,
      driver: car.currentDriverName,
    }))
    .sort((a, b) => a.carNum.localeCompare(b.carNum));

  const mRef = Object.assign({}, ...currentDrivers.map((e) => ({ [e.carNum]: e.name })));

  const sameDrivers = incoming.reduce((acc, e) => {
    return acc && e.driver == mRef[e.carNum];
  }, true);

  if (!sameDrivers) {
    console.log(`difference detected by analysis data`);

    incoming.forEach((car) => {
      if (mRef[car.carNum] != car.driver) {
        console.log(
          `analysis driver mismatch carNum: ${car.carNum} ref:${mRef[car.carNum]} new:${car.driver}`,
        );
        const found = current.find((c) => c.carNum === car.carNum);
        if (found) {
          found.driverName = car.driver;
        }
      }
    });
  }
};

export const {
  updateFromDriverData,
  updateFromAnalysisData,
  updateFromCarContainer,
  updateFromCarOccupancy,
  resetAvailableCars,
} = availableCarsSlice.actions;
export default availableCarsSlice.reducer;
