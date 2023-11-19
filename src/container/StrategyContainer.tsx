import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import {
  carNumberByCarIdx,
  collectCarsByCarClassFilter,
  findDriverByStint,
  getCarPitStops,
  getCarStints,
  orderedCarNumsByPosition,
  processCarClassSelectionNew,
  sortedSelectableCars,
  supportsCarData,
} from "../components/live/util";
import {
  CombinedStintData,
  colorsBySeatTime,
  getCombinedStintData,
} from "../components/nivo/stintsummary/commons";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { ApplicationState } from "../stores";
import { ICarBaseData } from "../stores/racedata/types";
import { globalSettings, strategySettings } from "../stores/ui/actions";

const { Option } = Select;

export const StrategyContainer: React.FC = () => {
  const cars = useSelector((state: ApplicationState) => state.raceData.availableCars);
  const carClasses = useSelector((state: ApplicationState) => state.raceData.availableCarClasses);
  const userSettings = useSelector((state: ApplicationState) => state.userSettings.strategy);

  const stateGlobalSettings = useSelector((state: ApplicationState) => state.userSettings.global);

  const carInfo = useSelector((state: ApplicationState) => state.raceData.carInfo);
  const carStints = useSelector((state: ApplicationState) => state.raceData.carStints);
  const carPits = useSelector((state: ApplicationState) => state.raceData.carPits);

  const showCars = useSelector((state: ApplicationState) => state.userSettings.strategy.showCars);
  const filterCarClasses = useSelector(
    (state: ApplicationState) => state.userSettings.strategy.filterCarClasses,
  );

  const stateCarManifest = useSelector((state: ApplicationState) => state.raceData.manifests.car);
  const raceOrder = useSelector((state: ApplicationState) => state.raceData.classification);
  const carData = useSelector((state: ApplicationState) => state.carData);
  const eventInfo = useSelector((state: ApplicationState) => state.raceData.eventInfo);
  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCars(cars, stateGlobalSettings.filterOrderByPosition, () =>
      orderedCarNumsByPosition(
        raceOrder,
        stateCarManifest,
        supportsCarData(eventInfo.raceloggerVersion) ? carNumberByCarIdx(carData) : undefined,
      ),
    );
  };
  const selectableCars = createSelectableCars(
    userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars,
  );

  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });

    const sortedSelectabled = createSelectableCars(collectCarsByCarClassFilter(cars, values));

    const reorderedShowCars = sortedSelectabled
      .map((c) => c.carNum)
      .filter((carNum) => newShowcars.includes(carNum));
    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: reorderedShowCars,
      selectableCars: sortedSelectabled,
    };
    // const curSettings = { ...userSettings, filterCarClasses: values };
    dispatch(strategySettings(curSettings));
    if (stateGlobalSettings.syncSelection) {
      dispatch(globalSettings({ ...stateGlobalSettings, filterCarClasses: values }));
    }
  };

  const props = {
    availableCars: selectableCars,
    availableClasses: carClasses.map((v) => v.name),
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarFilter: (selection: string[]) => {
      const newShowcars = selectableCars
        .filter((v) => selection.includes(v.carNum))
        .map((v) => v.carNum);
      const curSettings = { ...userSettings, showCars: newShowcars };
      dispatch(strategySettings(curSettings));
      if (stateGlobalSettings.syncSelection) {
        const newGlobalShowCars = [...stateGlobalSettings.showCars];
        selection.forEach((item) => {
          if (!newGlobalShowCars.includes(item)) {
            newGlobalShowCars.push(item);
          }
        });
        if (newGlobalShowCars.length !== stateGlobalSettings.showCars.length) {
          dispatch(globalSettings({ ...stateGlobalSettings, showCars: newGlobalShowCars }));
        }
      }
    },
    onSelectCarClassFilter: onSelectCarClassChange,
  };

  interface ICarCombinedStintData {
    carNum: string;
    data: CombinedStintData[];
  }
  const combinedData = showCars.map((carNum) => {
    const currentCarInfo = carInfo.find((v) => v.carNum === carNum)!;
    const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

    const driverColor = (si: IStintInfo): string =>
      colorLookup.get(findDriverByStint(currentCarInfo, si)?.driverName ?? "n.a.") ?? "black";
    return {
      carNum: carNum,
      combined: getCombinedStintData(
        getCarStints(carStints, carNum),
        getCarPitStops(carPits, carNum),
        driverColor,
      ),
    };
  });
  const combinedDataMinMax = combinedData
    .flatMap((a) => [...a.combined])
    .reduce(
      (a, b) => {
        return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
      },
      { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 },
    );

  return (
    <>
      <Row gutter={16}>
        <CarFilter {...props} />
      </Row>
      {userSettings.showCars.length > 0 ? (
        <>
          <Divider />
          {combinedData.map((c, idx) => (
            <Row gutter={16} key={idx}>
              <StintStretch
                carNum={c.carNum}
                height={30}
                showCarNum
                width={800}
                {...combinedDataMinMax}
                combinedStintData={c.combined}
              />
            </Row>
          ))}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};
