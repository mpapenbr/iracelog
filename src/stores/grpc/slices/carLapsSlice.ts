import {
  CarLaps,
  Lap,
} from "@buf/mpapenbr_testrepo.community_timostamm-protobuf-ts/testrepo/analysis/v1/car_laps_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = [] as CarLaps[];

export const carLapsSlice = createSlice({
  name: "carLaps",
  initialState,
  reducers: {
    initialCarLaps: (state, action: PayloadAction<CarLaps[]>) => {
      console.log(`initialCarLaps ${action.payload.length}`);
      return action.payload;
    },
    updateCarLaps: (state, action: PayloadAction<CarLaps[]>) => {
      if (action.payload.length > 0) {
        // console.log(`updateCarLaps ${action.payload.carLaps.length}`);
        return handleUpdate(state, action.payload);
      }
    },
    resetCarLaps: () => {
      return initialState;
    },
  },
});

export const handleUpdate = (current: CarLaps[], incoming: CarLaps[]): CarLaps[] => {
  if (incoming.length === 0) {
    return current;
  }
  const entryByNum = Object.assign({}, ...current.map((x) => ({ [x.carNum]: x })));
  const work: CarLaps[] = incoming.map((item) => {
    const existing = entryByNum[item.carNum];
    if (existing) {
      if (existing.laps.length === 0) {
        return { ...existing, laps: item.laps };
      }
      const last: Lap = _.last(existing.laps) ?? item.laps[0];
      if (last.lapNo != item.laps[0].lapNo) {
        const y = { ...existing, laps: [...existing.laps, ...item.laps] };
        return y;
      }
      if (last.lapTime != item.laps[0].lapTime) {
        return { ...existing, laps: [...existing.laps.slice(0, -1), item.laps[0]] };
      }

      return existing;
    } else {
      return item;
    }
  });

  return work;
};
export const { initialCarLaps, updateCarLaps, resetCarLaps } = carLapsSlice.actions;
export default carLapsSlice.reducer;
