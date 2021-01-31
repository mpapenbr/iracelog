import { Checkbox, Descriptions, Tabs } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { sprintf } from "sprintf-js";
import { IRaceContainer } from "../../stores/raceevents/types";
import { IStintData } from "../../stores/types/stints";
import { lapTimeString } from "../../utils/output";
import { stintDuration } from "../util/common";
import StintLapsCompareGraph from "./stintLapsCompareGraph";
import StintLapsCumCompareGraph from "./stintLapsCumCompareGraph";
import StintLapsGraph from "./stintLapsGraph";
import StintLapsTable from "./stintLapsTable";

interface IStintLapsProps {
  stint: IStintData;
  stints: IStintData[];
  raceContainer: IRaceContainer;
}
const { TabPane } = Tabs;

const StintLaps: React.FC<IStintLapsProps> = (props: IStintLapsProps) => {
  const [filterMode, setFilterMode] = useState(true);
  const header = () => {
    const title = sprintf("Stint #%d", props.stint.stintNo);
    return props.stint.laps.length > 0 ? (
      <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }} size="small" title={title}>
        <Descriptions.Item label="Out">{props.stint.laps[0].lapData.lapNo}</Descriptions.Item>
        <Descriptions.Item label="In">{_.last(props.stint.laps)!.lapData.lapNo}</Descriptions.Item>
        <Descriptions.Item label="Duration">{stintDuration(props.stint)}</Descriptions.Item>
        <Descriptions.Item label="Avg">{lapTimeString(props.stint.ranged.avg)}</Descriptions.Item>
      </Descriptions>
    ) : (
      <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }} size="small" title={title} />
    );
  };
  const prevStint = props.stints.find((s) => s.stintNo === props.stint.stintNo - 1);
  const nextStint = props.stints.find((s) => s.stintNo === props.stint.stintNo + 1);
  const onCheckboxChange = () => {
    console.log("set filter now to " + !filterMode);
    setFilterMode(!filterMode);
  };
  return (
    <>
      {header()}
      <Tabs
        defaultActiveKey="1"
        tabBarExtraContent={
          <Checkbox defaultChecked={filterMode} checked={filterMode} onChange={onCheckboxChange}>
            Filtered graphs
          </Checkbox>
        }
      >
        <TabPane tab="Table" key="1">
          <StintLapsTable {...props} />
        </TabPane>
        <TabPane tab="Graph" key="2">
          <StintLapsGraph {...props} filterLaps={filterMode} />
        </TabPane>
        {prevStint !== undefined ? (
          <TabPane tab="Comp to prev" key="3">
            <div>
              <StintLapsCompareGraph
                raceContainer={props.raceContainer}
                reference={props.stint}
                other={prevStint}
                filterLaps={filterMode}
              />
            </div>
            <div>
              <StintLapsCumCompareGraph
                raceContainer={props.raceContainer}
                reference={props.stint}
                other={prevStint}
                filterLaps={filterMode}
              />
            </div>
          </TabPane>
        ) : (
          <></>
        )}
        {nextStint !== undefined ? (
          <TabPane tab="Comp to next" key="4">
            <div>
              <StintLapsCompareGraph
                raceContainer={props.raceContainer}
                reference={props.stint}
                other={nextStint}
                filterLaps={filterMode}
              />
            </div>
            <div>
              <StintLapsCumCompareGraph
                raceContainer={props.raceContainer}
                reference={props.stint}
                other={nextStint}
                filterLaps={filterMode}
              />
            </div>
          </TabPane>
        ) : (
          <></>
        )}
      </Tabs>
    </>
  );
};
export default StintLaps;
