import { defaultProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { ICarBaseData } from "../../stores/racedata/types";
import { defaultWampData } from "../../stores/wamp/types";
import { distributeChanges, IProcessingInfo } from "../processData";

const baseData: IProcessingInfo = {
  currentData: defaultWampData,
  newData: defaultWampData,
};
describe("available cars", () => {
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
    var result: ICarBaseData[] = [];
    const onChangedAvailableCars = (cars: ICarBaseData[]) => {
      result = cars;
    };

    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carInfo: [{ carNum: "1", name: "a", carClass: "x", drivers: [], current: { driverName: "a", seatTime: [] } }],
      },
      onChangedAvailableCars: onChangedAvailableCars,
    };
    distributeChanges(work);
    expect(result).toMatchObject([{ carNum: "1", name: "a", carClass: "x" }]);
  });
});
export {};
