import { Empty } from "antd";
import _ from "lodash";
import React, { useEffect } from "react";
import { sprintf } from "sprintf-js";
import { DomainTuple, VictoryBar, VictoryChart, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from "victory";
import { ILaptimeExtended } from "../../stores/types/laptimes";
import { ignoreLap, IStintCompareProps } from "./stintCommon";

interface VData {
  x: number;
  y: number;
}
const StintLapsCumCompareGraph: React.FC<IStintCompareProps> = (props: IStintCompareProps) => {
  useEffect(() => {
    console.log("New call on compare graph");
  }, [props]);
  const calcXDom = (laps: ILaptimeExtended[]): DomainTuple => {
    if (laps.length === 0) return [0, 0];

    return [0, laps.length];
  };

  if (props.reference.laps.length < 2 || props.other.laps.length < 2) {
    return <Empty description="Not enough data" />;
  }

  const lapTimeGaps = props.reference.laps.map((d, idx) => {
    if (!(idx < props.other.laps.length)) return 0;
    const other = props.other.laps[idx];
    if (ignoreLap(d) || ignoreLap(other)) return 0;

    if (props.filterLaps && (d.filtered || other.filtered)) {
      return 0;
    }
    return props.other.laps[idx].lapData.lapTime - d.lapData.lapTime;
  });

  // const data  = lapTimeGaps.map((d, idx) => ({ x: idx + 1, y: d }));
  const data: VData[] = lapTimeGaps.reduce((a, b, idx) => {
    if (a.length === 0) {
      a.push({ x: idx + 1, y: b });
    } else {
      a.push({ x: idx + 1, y: b + a[idx - 1].y });
    }
    return a;
  }, [] as VData[]);

  const graphDomain = {
    x: calcXDom(props.reference.laps),
    y: [_.min(data.map((d) => d.y)), _.max(data.map((d) => d.y))] as DomainTuple,
  };
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
      labels={({ datum }) => {
        return sprintf("Stint lap %d: %.2f ", datum.x, datum.y);
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
      {/* <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
      <VictoryAxis />       */}
      <VictoryBar
        data={data}
        style={{
          data: {
            fill: ({ datum }) => (datum.y < 0 ? "red" : "green"),
          },
        }}
      />
    </VictoryChart>
  );
};
export default StintLapsCumCompareGraph;
