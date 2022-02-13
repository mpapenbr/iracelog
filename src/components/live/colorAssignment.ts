import { ICarBaseData } from "../../stores/racedata/types";
import { sortCarNumberStr } from "../../utils/output";
import { cat10Colors, catSet3 } from "./colors";

export const assignCarColors = (carInfos: ICarBaseData[]): Map<string, string> => {
  const carColor = new Map<string, string>();
  const carClasses = carInfos.reduce((prev, cur) => {
    return prev.add(cur.carClass);
  }, new Set<string>());
  const combined = cat10Colors.concat(catSet3);
  carClasses.forEach((cc) => {
    carInfos
      .filter((c) => c.carClass === cc)
      .map((c) => c.carNum)
      .sort(sortCarNumberStr)
      .forEach((num, idx) => carColor.set(num, combined[idx % combined.length]));
  });
  return carColor;
};
