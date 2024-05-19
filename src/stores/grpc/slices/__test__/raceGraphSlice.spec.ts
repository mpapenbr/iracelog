import { handleUpdate } from "../raceGraphSlice";

describe("check car lap additions", () => {
  test("do nothing when both empty", () => {
    const res = handleUpdate([], []);
    expect(res).toEqual([]);
  });
  test("first entry", () => {
    const res = handleUpdate(
      [],
      [{ lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }] }],
    );
    expect(res).toEqual([
      { lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }] },
    ]);
  });
  test("modify entry", () => {
    const res = handleUpdate(
      [{ lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }] }],
      [{ lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 10, pos: 1, pic: 1 }] }],
    );
    expect(res).toEqual([
      { lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 10, pos: 1, pic: 1 }] },
    ]);
  });
  test("add another lap entry", () => {
    const res = handleUpdate(
      [{ lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }] }],
      [{ lapNo: 2, carClass: "A", gaps: [{ carNum: "1", lapNo: 2, gap: 10, pos: 1, pic: 1 }] }],
    );
    expect(res).toEqual([
      {
        lapNo: 1,
        carClass: "A",
        gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }],
      },
      {
        lapNo: 2,
        carClass: "A",
        gaps: [{ carNum: "1", lapNo: 2, gap: 10, pos: 1, pic: 1 }],
      },
    ]);
  });
  test("two classes,mod one, add one", () => {
    const res = handleUpdate(
      [
        { lapNo: 1, carClass: "A", gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }] },
        { lapNo: 1, carClass: "B", gaps: [{ carNum: "10", lapNo: 1, gap: 0, pos: 1, pic: 1 }] },
      ],
      [
        { lapNo: 2, carClass: "A", gaps: [{ carNum: "1", lapNo: 2, gap: 0, pos: 1, pic: 1 }] },
        { lapNo: 1, carClass: "B", gaps: [{ carNum: "10", lapNo: 1, gap: 10, pos: 1, pic: 1 }] },
      ],
    );
    expect(res).toEqual([
      {
        lapNo: 1,
        carClass: "A",
        gaps: [{ carNum: "1", lapNo: 1, gap: 0, pos: 1, pic: 1 }],
      },
      {
        lapNo: 2,
        carClass: "A",
        gaps: [{ carNum: "1", lapNo: 2, gap: 0, pos: 1, pic: 1 }],
      },
      {
        lapNo: 1,
        carClass: "B",
        gaps: [{ carNum: "10", lapNo: 1, gap: 10, pos: 1, pic: 1 }],
      },
    ]);
  });
});
