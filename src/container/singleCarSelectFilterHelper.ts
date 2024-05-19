import { collectCarsByCarClassFilterGrpc, sortedSelectableCarsGrpc } from "../components/live/util";
import { ICarBaseData } from "../stores/grpc/slices/availableCarsSlice";
import { IGlobalSettings, ISingleCarSelectFilterSettings } from "../stores/grpc/slices/types";

interface CarFilterProps {
  availableCars: ICarBaseData[];
  availableClasses: string[];
  selectedCarClasses: string[];
  onSelectCarClassFilter: (value: string[]) => void;
}

export interface InputData {
  stateGlobalSettings: IGlobalSettings;
  pageFilterSettings: ISingleCarSelectFilterSettings;
  raceOrder: string[];
  availableCars: ICarBaseData[];
  availableClasses: string[];
  selectedCallback: (arg: ISingleCarSelectFilterSettings) => void;
}
interface SelectValues {
  referenceCarNum?: string;
  filterCarClasses: string[];
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
  const selectableCars = createSelectableCars(
    data.pageFilterSettings.selectableCars.length > 0
      ? data.pageFilterSettings.selectableCars
      : data.availableCars,
  );
  const { referenceCarNum, filterCarClasses } = selectSettings();

  const onSelectCarClassChange = (values: string[]) => {
    const sortedSelectable = createSelectableCars(
      collectCarsByCarClassFilterGrpc(data.availableCars, values),
    );
    data.selectedCallback({
      filterCarClasses: values,
      selectableCars: sortedSelectable,
    } as ISingleCarSelectFilterSettings);
  };

  return {
    availableCars: selectableCars,
    availableClasses: data.availableClasses,
    selectedCarClasses: filterCarClasses,

    onSelectCarClassFilter: onSelectCarClassChange,
  };
};
