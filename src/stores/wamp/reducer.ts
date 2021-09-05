import { IDataEntrySpec, IManifests } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Reducer } from "redux";
import { globalWamp } from "../../commons/globals";
import { WampActionTypes } from "./actions";
import { defaultWampData, IWampState } from "./types";

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

    case WampActionTypes.RESET:
      return { ...state, data: defaultWampData };
    case WampActionTypes.SET:
      return { ...state, data: { ...action.payload, dummy: "Hallo" } };

    case WampActionTypes.UPDATE_DUMMY: {
      return { ...state, data: { ...state.data, dummy: action.payload } };
    }
    case WampActionTypes.UPDATE_MANIFESTS: {
      if (Array.isArray(action.payload)) {
        return { ...state, data: { ...state.data, manifests: postProcessManifest(action.payload[0]) } };
      } else {
        return { ...state, data: { ...state.data, manifests: postProcessManifest(action.payload) } };
      }
    }
    case WampActionTypes.SET_MANIFESTS: {
      console.log(action.payload);
      return { ...state, data: { ...state.data, manifests: action.payload } };
    }
    case WampActionTypes.UPDATE_SESSION: {
      if (Array.isArray(action.payload)) {
        return { ...state, data: { ...state.data, session: action.payload[0] } };
      } else return state;
    }

    case WampActionTypes.UPDATE_FROM_STATE: {
      // payload is the big state message

      // const sessionTime = getValueViaSpec(action.payload.session, state.data.manifests.session, "sessionTime");
      // const newCarStints = processForCurrentStint(state.data, sessionTime, action.payload.cars);
      // const { carStints, carPits, carComputeState } = processForStint2(state.data, sessionTime, action.payload.cars);
      // const newCarInfo = processForCarInfo(state.data, sessionTime, action.payload.cars);

      const newData = globalWamp.processor?.process([action.payload]);
      return { ...state, data: { ...state.data, ...newData } };
      // return {
      //   ...state,
      //   data: {
      //     ...state.data,
      //     carStints: carStints,
      //     carPits: carPits,
      //     carComputeState: carComputeState,
      //     carInfo: newCarInfo,
      //   },
      // };
    }

    case WampActionTypes.UPDATE_PITSTOPS: {
      if (Array.isArray(action.payload)) {
        if (action.payload[0].data.length === 0) return state;
        return state;
        // const newPitData = processPitData(action.payload[0].data, state.data.carPits);
        // return { ...state, data: { ...state.data, carPits: newPitData } };
        // const newStintData = processStintData(action.payload[0].data, state.data.carStints);
        // return { ...state, data: { ...state.data, carPits: newPitData, carStints: newStintData } };
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

interface TmpManifestInboundData {
  car: string[];
  session: string[];
  pit: string[];
  message: string[];
}
export const postProcessManifest = (data: TmpManifestInboundData): IManifests => {
  const toDataSpec = (d: string[]): IDataEntrySpec[] => d.map((v) => ({ name: v, type: "string" }));
  return {
    car: toDataSpec(data.car),
    session: toDataSpec(data.session),
    pit: toDataSpec(data.pit),
    message: toDataSpec(data.message),
  };
};

const getValueViaSpec = (data: [], spec: IDataEntrySpec[], key: string): any => {
  const idx = spec.findIndex((v) => v.name === key);
  if (idx < 0) {
    return undefined;
  } else {
    return data[idx];
  }
};

export { reducer as wampReducer, initialState as wampInitialState };
