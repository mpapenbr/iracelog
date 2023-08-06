import { IStintInfo, defaultStintInfo } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { isInSelectedRange } from "../util";

describe("stint visibility check", () => {
  const sampleRange: [number, number] = [10, 20];
  const checkData = (exitTime: number, enterTime: number): IStintInfo => ({
    ...defaultStintInfo,
    exitTime,
    enterTime,
  });
  it("stint complete inside", () => {
    expect(isInSelectedRange(checkData(11, 15), sampleRange)).toBeTruthy();
  });
  it("stint complete left outside", () => {
    expect(isInSelectedRange(checkData(1, 2), sampleRange)).toBeFalsy();
  });
  it("stint complete right outside", () => {
    expect(isInSelectedRange(checkData(22, 30), sampleRange)).toBeFalsy();
  });
  it("stint starts left outside, ends inside", () => {
    expect(isInSelectedRange(checkData(5, 11), sampleRange)).toBeTruthy();
  });
  it("stint starts inside, ends right outside", () => {
    expect(isInSelectedRange(checkData(15, 21), sampleRange)).toBeTruthy();
  });
  it("stint starts outside, ends outside", () => {
    expect(isInSelectedRange(checkData(8, 22), sampleRange)).toBeTruthy();
  });
});
