import { IStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { Divider, Empty, Row, Select } from "antd";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CarFilter from "../components/live/carFilter";
import {
  collectCarsByCarClassFilter,
  findDriverByStint,
  getCarPitStops,
  getCarStints,
  processCarClassSelectionNew,
} from "../components/live/util";
import { colorsBySeatTime, getCombinedStintData } from "../components/nivo/stintsummary/commons";
import StintStretch from "../components/nivo/stintsummary/stintstretch";
import { ApplicationState } from "../stores";
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
  const filterCarClasses = useSelector((state: ApplicationState) => state.userSettings.strategy.filterCarClasses);

  const selectableCars = userSettings.selectableCars.length > 0 ? userSettings.selectableCars : cars;
  // console.log(selectableCars);
  const dispatch = useDispatch();

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = processCarClassSelectionNew({
      cars: cars,
      currentFilter: filterCarClasses,
      currentShowCars: showCars,
      newSelection: values,
    });
    const curSettings = {
      ...userSettings,
      filterCarClasses: values,
      showCars: newShowcars,
      selectableCars: collectCarsByCarClassFilter(cars, values),
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
      const newShowcars = selectableCars.filter((v) => selection.includes(v.carNum)).map((v) => v.carNum);
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

  const combinedData = showCars.map((carNum) => {
    const currentCarInfo = carInfo.find((v) => v.carNum === carNum)!;
    const { colorLookup } = colorsBySeatTime(currentCarInfo.drivers);

    const driverColor = (si: IStintInfo): string =>
      colorLookup.get(findDriverByStint(currentCarInfo, si)?.driverName ?? "n.a.") ?? "black";
    return getCombinedStintData(getCarStints(carStints, carNum), getCarPitStops(carPits, carNum), driverColor);
  });
  const combinedDataMinMax = combinedData
    .flatMap((a) => [...a])
    .reduce(
      (a, b) => {
        return { minTime: Math.min(a.minTime, b.minTime), maxTime: Math.max(a.maxTime, b.maxTime) };
      },
      { minTime: Number.MAX_SAFE_INTEGER, maxTime: 0 }
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
                carNum={c[0]?.data.carNum ?? "n.a."}
                height={30}
                showCarNum
                width={800}
                {...combinedDataMinMax}
                combinedStintData={c}
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
