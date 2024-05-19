import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as CarStuffActions from "./actions";

import { CurrentCarOccState } from "./types";

const initCurrentCarOccState: CurrentCarOccState = {
  sessionTime: 0,
  carOcc: [],
};
// Car
export const CurrentCarOccReducer = reducerWithInitialState(initCurrentCarOccState)
  .case(CarStuffActions.updateGrpcLiveDriverData, (state, liveDriverData) => {
    console.log("CarStuffReducer: updateGrpcCarStuff", liveDriverData.sessionTime);
    const currentDrivers = state.carOcc.map((car) => ({ carNum: car.carNum, name: car.driver }));

    if (liveDriverData.entries.length != currentDrivers.length) {
      console.log(`change in driver count detected`);

      const newData = liveDriverData.entries.map((car) => ({
        carIdx: car.car?.carIdx!,
        driver: liveDriverData.currentDrivers[car.car?.carIdx!],
        carNum: car.car?.carNumber!,
        pos: 0,
        team: car.team?.name ?? "",
      }));
      // console.log(newData);
      return {
        sessionTime: liveDriverData.sessionTime,
        carOcc: newData,
      };
    }
    return state;
  })
  .case(CarStuffActions.updateGrpcLiveAnalysisData, (state, liveAnalysis) => {
    // console.log("CarStuffReducer: updateGrpcCarStuff2", cars.length);
    const currentDrivers = state.carOcc.map((car) => ({ carNum: car.carNum, name: car.driver }));

    const incoming = liveAnalysis.carOccupancies
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
        }
      });
      const newOcc = incoming.map((car) => ({
        carIdx: 0,
        driver: car.driver,
        carNum: car.carNum,
        pos: 0,
        team: "",
      }));
      return {
        sessionTime: liveAnalysis.timestamp,
        carOcc: newOcc,
      };
    }
    return state;
  });
