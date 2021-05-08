import { updateAvailableCarClasses, updateAvailableCars } from "../actions";
import { AvailableCarClassesReducer, AvailableCarsReducer } from "../reducer";

describe("check reducers", () => {
  it("should set available cars", () => {
    const data = [
      { carNum: "1", name: "a", carClass: "x" },
      { carNum: "2", name: "b", carClass: "y" },
    ];
    expect(AvailableCarsReducer([], updateAvailableCars(data))).toMatchObject(data);
  });

  it("should set available car classes", () => {
    const data = [{ name: "class a" }, { name: "class b" }];
    expect(AvailableCarClassesReducer([], updateAvailableCarClasses(data))).toMatchObject(data);
  });
});

export {};
