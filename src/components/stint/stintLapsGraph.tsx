import { Empty } from "antd";
import _ from "lodash";
import React, { useEffect } from "react";
import { sprintf } from "sprintf-js";
import {
  DomainTuple,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { IRaceContainer } from "../../stores/raceevents/types";
import { ILaptimeExtended } from "../../stores/types/laptimes";
import { IStintData } from "../../stores/types/stints";
import { lapTimeString, lapTimeStringTenths } from "../../utils/output";

interface IStintLapsProps {
  stint: IStintData;
  raceContainer: IRaceContainer;
}

const StintLapsGraph: React.FC<IStintLapsProps> = (props: IStintLapsProps) => {
  useEffect(() => {
    console.log("New call!");
  }, [props]);
  const calcXDom = (laps: ILaptimeExtended[]): DomainTuple => {
    if (laps.length === 0) return [0, 0];

    return [laps[0].lapData.lapNo, _.last(laps)!.lapData.lapNo];
  };
  const calcYDom = (stint: IStintData): DomainTuple => {
    return [stint.ranged.avg * 0.98, stint.ranged.avg * 1.02]; // TODO: sync the 2% with server call ;)
  };

  if (props.stint.laps.length < 2) {
    return <Empty description="Not enough data" />;
  }
  const data = props.stint.laps.filter((d) => !d.filtered).map((d) => ({ x: d.lapData.lapNo, y: d.lapData.lapTime }));
  const moveAvg = props.stint.laps.map((d) => ({ x: d.lapData.lapNo, y: d.rollAvgFiltered }));

  const graphDomain = { x: calcXDom(props.stint.laps), y: calcYDom(props.stint) };
  const tt = (
    <VictoryTooltip
      constrainToVisibleArea
      center={{ x: 225, y: 30 }}
      flyoutWidth={150}
      flyoutHeight={30}
      cornerRadius={0}
    />
  );
  const vvc = (
    <VictoryVoronoiContainer
      voronoiDimension="x"
      mouseFollowTooltips={true}
      voronoiBlacklist={["avg"]}
      labels={({ datum }) => {
        return sprintf("Lap %d: %s ", datum.x, lapTimeString(datum.y));
      }}
      labelComponent={tt}
    />
  );
  return (
    <VictoryChart
      standalone={true}
      theme={VictoryTheme.grayscale}
      domain={graphDomain}
      domainPadding={{ x: [10, 0] }}
      containerComponent={vvc}
    >
      <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
      <VictoryAxis />
      <VictoryLine name="avg" data={moveAvg} style={{ data: { stroke: "green" } }} />
      <VictoryScatter data={data} />
    </VictoryChart>
  );
};
export default StintLapsGraph;
