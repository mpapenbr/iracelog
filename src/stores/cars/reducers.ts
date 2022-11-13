import { combineReducers } from "redux";
import { reducerWithInitialState } from "typescript-fsa-reducers";
import * as CarInfoActions from "./actions";
import { ICarClass, ICarInfo, ICarInfoContainer, IEntry, initialCarInfoContainer } from "./types";

const CarDataReducer = reducerWithInitialState(initialCarInfoContainer).case(
  CarInfoActions.updateCarData,
  (state, data) => {
    // console.log(data)
    return { ...data };
  },
);
const CarsReducer = reducerWithInitialState([] as ICarInfo[]).case(
  CarInfoActions.updateCarInfos,
  (state, data) => {
    // console.log(data)
    return data;
  },
);
const CarsClassesReducer = reducerWithInitialState([] as ICarClass[]).case(
  CarInfoActions.updateCarClasses,
  (state, data) => {
    // console.log(data)
    return data;
  },
);
const CarEntriesReducer = reducerWithInitialState([] as IEntry[]).case(
  CarInfoActions.updateCarEntries,
  (state, data) => {
    // console.log(data);
    return [...data];
  },
);

const combinedReducers = combineReducers<ICarInfoContainer>({
  // carData: CarDataReducer,
  cars: CarsReducer,
  carClasses: CarsClassesReducer,
  entries: CarEntriesReducer,
});

export { combinedReducers as carDataReducers };
