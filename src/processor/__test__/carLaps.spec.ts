import {
  defaultProcessRaceStateData,
  ICarLaps,
} from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { distributeChanges, IProcessingInfo } from "../processData";

const baseData: IProcessingInfo = {
  currentData: {
    ...defaultProcessRaceStateData,
    carLaps: [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 10 }] }],
  },
  newData: defaultProcessRaceStateData,
};
describe("available cars", () => {
  it("should not break on missing handler", () => {
    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carLaps: [{ carNum: "1", laps: [] }],
      },
    };
    distributeChanges(work);
  });

  it("should detect additional lap to car", () => {
    let result: ICarLaps[] = [];
    const onChangedCarLaps = (data: ICarLaps[]) => {
      result = data;
    };

    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carLaps: [
          {
            carNum: "1",
            laps: [
              { lapNo: 1, lapTime: 10 },
              { lapNo: 2, lapTime: 11 },
            ],
          },
        ],
      },
      onChangedCarLaps: onChangedCarLaps,
    };
    distributeChanges(work);
    expect(result).toMatchObject([
      {
        carNum: "1",
        laps: [
          { lapNo: 1, lapTime: 10 },
          { lapNo: 2, lapTime: 11 },
        ],
      },
    ]);
  });

  it("should detect additional car entry", () => {
    let result: ICarLaps[] = [];
    const onChangedCarLaps = (data: ICarLaps[]) => {
      result = data;
    };

    const work: IProcessingInfo = {
      ...baseData,
      newData: {
        ...defaultProcessRaceStateData,
        carLaps: [
          {
            carNum: "1",
            laps: [{ lapNo: 1, lapTime: 10 }],
          },
          {
            carNum: "2",
            laps: [{ lapNo: 1, lapTime: 20 }],
          },
        ],
      },
      onChangedCarLaps: onChangedCarLaps,
    };
    distributeChanges(work);
    expect(result).toMatchObject([
      {
        carNum: "1",
        laps: [{ lapNo: 1, lapTime: 10 }],
      },
      {
        carNum: "2",
        laps: [{ lapNo: 1, lapTime: 20 }],
      },
    ]);
  });
});
export {};
