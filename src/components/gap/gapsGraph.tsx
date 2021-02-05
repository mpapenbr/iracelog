import _ from "lodash";
import React, { useEffect } from "react";
import { sprintf } from "sprintf-js";
import {
  DomainTuple,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { IRaceContainer } from "../../stores/raceevents/types";
import { IGap } from "../../stores/types/gaps";

interface IGapProgressionProps {
  raceContainer: IRaceContainer;
  gaps: IGap[];
  range?: number;
}
const GapsGraph: React.FC<IGapProgressionProps> = (props: IGapProgressionProps) => {
  useEffect(() => {
    console.log("New call on compare graph");
  }, [props]);
  const calcXDom = (laps: IGap[]): DomainTuple => {
    if (laps.length === 0) return [0, 0];

    return [0, _.last(laps)?.lapNo || 0];
  };

  const data = props.gaps.map((d, idx) => ({ x: d.lapNo, y: d.delta }));
  const rangedDeltaValues = props.gaps
    .filter((d) => (props.range !== undefined ? Math.abs(d.delta) < props.range : true))
    .map((d) => d.delta);

  const graphDomain = {
    x: calcXDom(props.gaps),
    y: [_.min(rangedDeltaValues), _.max(rangedDeltaValues)] as DomainTuple,
  };
  console.log(graphDomain);
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
  const wantBar = false;
  return (
    <VictoryChart
      width={1000}
      height={500}
      standalone={true}
      theme={VictoryTheme.grayscale}
      domain={graphDomain}
      domainPadding={{ x: [10, 0] }}
      containerComponent={vvc}
    >
      {/* <VictoryAxis dependentAxis={true} tickFormat={(t) => lapTimeStringTenths(t)} fixLabelOverlap />
      <VictoryAxis />       */}
      {wantBar ? (
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: ({ datum }) => (datum.y < 0 ? "red" : "green"),
            },
          }}
        />
      ) : (
        <VictoryLine data={data} />
      )}
    </VictoryChart>
  );
};
export default GapsGraph;
