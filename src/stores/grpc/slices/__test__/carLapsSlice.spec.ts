import { handleUpdate } from "../carLapsSlice";

describe("check car lap additions", () => {
  test("do nothing when both empty", () => {
    const res = handleUpdate([], []);
    expect(res).toEqual([]);
  });
  test("add new entry", () => {
    const res = handleUpdate([], [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }]);
    expect(res).toEqual([{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }]);
  });
  test("noop when matching", () => {
    const res = handleUpdate(
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }],
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }],
    );
    expect(res).toEqual([{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }]);
  });
  test("changed lap time", () => {
    const res = handleUpdate(
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }],
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 10 }] }],
    );
    expect(res).toEqual([{ carNum: "1", laps: [{ lapNo: 1, lapTime: 10 }] }]);
  });
  test("add next lap time", () => {
    const res = handleUpdate(
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }],
      [{ carNum: "1", laps: [{ lapNo: 2, lapTime: 2 }] }],
    );
    expect(res).toEqual([
      {
        carNum: "1",
        laps: [
          { lapNo: 1, lapTime: 1 },
          { lapNo: 2, lapTime: 2 },
        ],
      },
    ]);
  });
  test("add new car lap time", () => {
    const res = handleUpdate(
      [{ carNum: "1", laps: [{ lapNo: 1, lapTime: 1 }] }],
      [
        { carNum: "1", laps: [{ lapNo: 2, lapTime: 2 }] },
        { carNum: "20", laps: [{ lapNo: 2, lapTime: 20 }] },
      ],
    );
    expect(res).toEqual([
      {
        carNum: "1",
        laps: [
          { lapNo: 1, lapTime: 1 },
          { lapNo: 2, lapTime: 2 },
        ],
      },
      {
        carNum: "20",
        laps: [{ lapNo: 2, lapTime: 20 }],
      },
    ]);
  });
});
