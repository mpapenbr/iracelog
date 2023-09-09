import { ICarInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { findDriverBySessionTime } from "../util";

describe("find driver by session time", () => {
  const sampleRange: [number, number] = [10, 20];
  const carInfo: ICarInfo = {
    carNum: "12",
    carClass: "myclass",
    name: "Team name",
    drivers: [
      {
        driverName: "Driver A",
        seatTime: [{ enterCarTime: 10, leaveCarTime: 20 }],
      },
      {
        driverName: "Driver B",
        seatTime: [{ enterCarTime: 21, leaveCarTime: 30 }],
      },
    ],
    current: {
      driverName: "Driver B",
      seatTime: [{ enterCarTime: 21, leaveCarTime: 30 }],
    },
  };

  test("inside seat time", () => {
    const res = findDriverBySessionTime(carInfo, 15);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("left boundary", () => {
    const res = findDriverBySessionTime(carInfo, 10);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("right boundary", () => {
    const res = findDriverBySessionTime(carInfo, 20);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("between change (middle)", () => {
    const res = findDriverBySessionTime(carInfo, 20.5);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("between change (closer to A)", () => {
    const res = findDriverBySessionTime(carInfo, 20.3);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("between change (closer to B)", () => {
    const res = findDriverBySessionTime(carInfo, 20.7);
    expect(res).toMatchObject({ driverName: "Driver B" });
  });
  test("before recording (should yield first entry)", () => {
    const res = findDriverBySessionTime(carInfo, 5);
    expect(res).toMatchObject({ driverName: "Driver A" });
  });
  test("after recording (should yield last entry)", () => {
    const res = findDriverBySessionTime(carInfo, 35);
    expect(res).toMatchObject({ driverName: "Driver B" });
  });
});
