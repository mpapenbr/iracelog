import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { ICarClass } from "../../stores/racedata/types";
import { defaultWampData } from "../../stores/wamp/types";
import { distributeChanges, IProcessingInfo } from "../processData";

const baseData: IProcessingInfo = {
  currentData: defaultWampData,
  newData: defaultWampData,
};
describe("available car classes", () => {
  it("should not break on missing handler", () => {
    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carInfo: [{ carNum: "1", name: "a", carClass: "x", drivers: [], current: { driverName: "a", seatTime: [] } }],
      },
    };
    distributeChanges(work);
  });

  it("should invoke change handler", () => {
    var result: ICarClass[] = [];
    const onChangedAvailableCarClasses = (cars: ICarClass[]) => {
      result = cars;
    };

    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carInfo: [{ carNum: "1", name: "a", carClass: "x", drivers: [], current: { driverName: "a", seatTime: [] } }],
      },
      onChangedAvailableCarClasses: onChangedAvailableCarClasses,
    };
    distributeChanges(work);
    expect(result).toMatchObject([{ name: "x" }]);
  });
});
export {};
