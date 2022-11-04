import { combineReducers } from "redux";
import { carDataReducers } from "./cars/reducers";
import { ICarInfoContainer } from "./cars/types";
import { IRaceData, raceDataReducers } from "./racedata/reducer";

import { speedmapReducers } from "./speedmap/reducer";
import { ISpeedmap } from "./speedmap/types";
import { userSettingsReducer } from "./ui/reducer";
import { IUserSettings } from "./ui/types";

export interface ApplicationState {
  // wamp: IWampState;
  userSettings: IUserSettings;
  raceData: IRaceData;

  speedmap: ISpeedmap;
  carData: ICarInfoContainer;
}

// export interface IMetaActions extends PayloadMetaAction<TypeConstant,IMeta> {}

export const createRootReducer = () =>
  combineReducers({
    // wamp: wampReducer, // will be removed
    raceData: raceDataReducers, // this is new place for everything concerning the race data of a single event
    userSettings: userSettingsReducer, // this is the new place for user settings
    speedmap: speedmapReducers,
    carData: carDataReducers,
  });
