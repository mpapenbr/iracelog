import { Reducer } from "redux";
import { WampActionTypes } from "./actions";
import { defaultPitInfo, defaultWampData, ICarPitInfo, IDataEntrySpec, IWampState, PitManifest } from "./types";

const initialState: IWampState = {
  data: defaultWampData,
};

const reducer: Reducer<IWampState> = (state = initialState, action) => {
  switch (action.type) {
    case WampActionTypes.CONNECT: {
      // connectAndSubscribe();
      return state;
    }

    case WampActionTypes.CONNECTED:
      return { ...state, data: { ...state.data, connected: true } };

    case WampActionTypes.UPDATE_DUMMY: {
      return { ...state, data: { ...state.data, dummy: action.payload } };
    }
    case WampActionTypes.UPDATE_MANIFESTS: {
      if (Array.isArray(action.payload)) {
        return { ...state, data: { ...state.data, manifests: action.payload[0] } };
      } else return state;
    }
    case WampActionTypes.UPDATE_SESSION: {
      if (Array.isArray(action.payload)) {
        return { ...state, data: { ...state.data, session: action.payload[0] } };
      } else return state;
    }
    case WampActionTypes.UPDATE_CARS: {
      if (Array.isArray(action.payload)) {
        return { ...state, data: { ...state.data, cars: action.payload[0] } };
      } else return state;
    }
    case WampActionTypes.UPDATE_PITSTOPS: {
      if (Array.isArray(action.payload)) {
        if (action.payload[0].data.length === 0) return state;
        const newPitData = processPitData(action.payload[0], state.data.carPits);
        return { ...state, data: { ...state.data, carPits: newPitData } };
      } else return state;
    }

    case WampActionTypes.UPDATE_MESSAGES: {
      if (Array.isArray(action.payload)) {
        const newMessages = action.payload[0];
        if (newMessages.data.length === 0) return state;
        console.log("Es gibt was zu tun!");
        const newData = [newMessages].concat(state.data.infoMsgs);

        return { ...state, data: { ...state.data, infoMsgs: newData } };
      } else return state;
    }

    default:
      return state;
  }
};

const getValueViaSpec = (data: [], spec: IDataEntrySpec[], key: string): any => {
  const idx = spec.findIndex((v) => v.name === key);
  if (idx < 0) {
    return undefined;
  } else {
    return data[idx];
  }
};

const processPitData = (payloadData: any, currentStateData: ICarPitInfo[]): ICarPitInfo[] => {
  // console.log({ payloadData });
  let workData = [...currentStateData];
  payloadData.data.forEach((e: []) => {
    const num = getValueViaSpec(e, PitManifest, "carNum");
    // console.log(num);
    let found = workData.find((d) => d.carNum === num);
    if (found === undefined) {
      found = { carNum: num, current: { ...defaultPitInfo, carNum: num }, history: [] };
      workData.push(found);
    }
    const what = getValueViaSpec(e, PitManifest, "type");
    if (what === "enter") {
      found.current.enterTime = getValueViaSpec(e, PitManifest, "enterTime");
      found.current.stintTime = getValueViaSpec(e, PitManifest, "stintTime");
      found.current.lapEnter = getValueViaSpec(e, PitManifest, "lapEnter");
    }
    if (what === "exit") {
      found.current.laneTime = getValueViaSpec(e, PitManifest, "laneTime");
      found.history.push({ ...found.current });
      found.current.exitTime = getValueViaSpec(e, PitManifest, "exitTime");
      found.current.lapExit = getValueViaSpec(e, PitManifest, "lapExit");
    }
  });
  return workData;
};

export { reducer as wampReducer, initialState as wampInitialState };
