import { StintPart } from "@buf/mpapenbr_iracelog.bufbuild_es/iracelog/predict/v1/predict_pb";
import _ from "lodash";
import { PredictData } from "../stores/grpc/slices/predictSlice";

export const predictDataSorter = (a: PredictData, b: PredictData) => {
  const lpA = _.last(a.r.parts)!;
  const lpB = _.last(b.r.parts)!;
  let ret = (lpB.partType.value as StintPart).lapEnd - (lpA.partType.value as StintPart).lapEnd;
  if (ret == 0) {
    const aEnd = Number(lpA.end?.seconds) + Number(lpA.end?.nanos) / 1e9;
    const bEnd = Number(lpB.end?.seconds) + Number(lpB.end?.nanos) / 1e9;
    return aEnd - bEnd;
  }
  return ret;
};
