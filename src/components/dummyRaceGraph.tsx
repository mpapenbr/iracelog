import * as React from "react";
import { useSelector } from "react-redux";
import { ApplicationState } from "../stores";

export const DummyRaceGraph: React.FC<{}> = () => {
  const raceGraph = useSelector((state: ApplicationState) => state.raceData.raceGraph);
  console.log("Dummy with raceGraph" + raceGraph.length);
  return <div>nothing cool yet</div>;
};
