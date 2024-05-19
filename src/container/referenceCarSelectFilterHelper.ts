import {
  collectCarsByCarClassFilterGrpc,
  processCarClassSelectionNew,
  sortedSelectableCarsGrpc,
} from "../components/live/util";
import { ICarBaseData } from "../stores/grpc/slices/availableCarsSlice";
import { IGlobalSettings, IReferenceCarSelectFilterSettings } from "../stores/grpc/slices/types";

/*
 * This is a helper function for the following situation.
 * - prefilter cars by car class
 * - select reference from prefiltered cars
 */

export interface InputData {
  stateGlobalSettings: IGlobalSettings;
  pageFilterSettings: IReferenceCarSelectFilterSettings;
  raceOrder: string[];
  availableCars: ICarBaseData[];
  availableClasses: string[];
  selectedCallback: (arg: IReferenceCarSelectFilterSettings) => void;
  /**
   * if this is set, the car filter will be filled with cars of the selected car class
   */
  autoFillCars?: boolean;
}

interface CarFilterProps {
  availableCars: ICarBaseData[];
  availableClasses: string[];
  selectedCars: string[];
  selectedCarClasses: string[];
  onSelectCarClassFilter: (value: string[]) => void;
  selectedReferenceCar?: string;
}

interface SelectValues {
  showCars: string[];
  filterCarClasses: string[];
  referenceCarNum?: string;
}
export const prepareFilterData = (data: InputData): CarFilterProps => {
  const selectSettings = (): SelectValues => {
    if (data.stateGlobalSettings.syncSelection) {
      return data.stateGlobalSettings;
    } else {
      return data.pageFilterSettings;
    }
  };

  const createSelectableCars = (cars: ICarBaseData[]): ICarBaseData[] => {
    return sortedSelectableCarsGrpc(
      cars,
      data.stateGlobalSettings.filterOrderByPosition,
      () => data.raceOrder,
    );
  };

  const { showCars, filterCarClasses, referenceCarNum } = selectSettings();
  const selectableCars = createSelectableCars(
    collectCarsByCarClassFilterGrpc(data.availableCars, filterCarClasses),
  );

  const onSelectCarClassChange = (values: string[]) => {
    const newShowcars = data.autoFillCars
      ? processCarClassSelectionNew({
          cars: data.availableCars,
          currentFilter: filterCarClasses,
          currentShowCars: showCars,
          newSelection: values,
        })
      : showCars;

    const sortedSelectable = createSelectableCars(
      collectCarsByCarClassFilterGrpc(data.availableCars, values),
    );

    const reorderedShowCars = sortedSelectable
      .map((c) => c.carNum)
      .filter((carNum) => newShowcars.includes(carNum));
    data.selectedCallback({
      filterCarClasses: values,
      showCars: reorderedShowCars,
      selectableCars: sortedSelectable,
      selectableReferenceCars: reorderedShowCars,
    } as IReferenceCarSelectFilterSettings);
  };

  return {
    availableCars: selectableCars,
    availableClasses: data.availableClasses,
    selectedCars: showCars,
    selectedCarClasses: filterCarClasses,
    onSelectCarClassFilter: onSelectCarClassChange,
    selectedReferenceCar: referenceCarNum,
  };
};
