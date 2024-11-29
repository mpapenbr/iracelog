import { RaceGraph } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/analysis/v1/racegraph_pb";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [] as RaceGraph[];

export const raceGraphSlice = createSlice({
  name: "raceGraph",
  initialState,
  reducers: {
    initialRaceGraph: (state, action: PayloadAction<RaceGraph[]>) => {
      console.log(`initialRaceGraph ${action.payload.length}`);
      return action.payload;
    },
    updateRaceGraph: (state, action: PayloadAction<RaceGraph[]>) => {
      // console.log(`updateRaceGraph ${action.payload.raceGraph.length}`);
      // console.log(action.payload.raceGraph);
      return handleUpdate(state, action.payload);
    },
    resetRaceGraph: () => {
      return initialState;
    },
  },
});

export const handleUpdate = (current: RaceGraph[], incoming: RaceGraph[]): RaceGraph[] => {
  // create a map with carClass as key and the object as list of values of type RaceGraph
  const curByClass = current
    // .toSorted((a, b) => a.lapNo - b.lapNo)
    .reduce((map, obj) => {
      const key = obj.carClass;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(obj);
      return map;
    }, new Map<string, RaceGraph[]>());

  const incByClass = Object.assign({}, ...incoming.map((x) => ({ [x.carClass]: x })));
  incoming.forEach((item) => {
    const existing = curByClass.get(item.carClass);
    if (existing) {
      if (existing.length === 0) {
        existing.push(item);
        return;
      }
      if (existing.slice(-1)[0].lapNo === item.lapNo) {
        const newByClassEntry = [...existing.slice(0, -1), item];
        curByClass.set(item.carClass, newByClassEntry);
        return;
      }
      curByClass.set(item.carClass, [...existing, item]);
    } else {
      curByClass.set(item.carClass, [item]);
    }
  });

  // flatten the map to a list of RaceGraph objects
  const ret = Array.from(curByClass.values()).flatMap((v) => [...v]);
  return ret;
};

export const { initialRaceGraph, updateRaceGraph, resetRaceGraph } = raceGraphSlice.actions;
export default raceGraphSlice.reducer;
