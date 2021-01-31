import { Descriptions, Tabs } from "antd";
import _ from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { IRaceContainer } from "../../stores/raceevents/types";
import { IStintData } from "../../stores/types/stints";
import { lapTimeString } from "../../utils/output";
import { stintDuration } from "../util/common";
import StintLapsGraph from "./stintLapsGraph";
import StintLapsTable from "./stintLapsTable";

interface IStintLapsProps {
  stint: IStintData;
  raceContainer: IRaceContainer;
}
const { TabPane } = Tabs;

const StintLaps: React.FC<IStintLapsProps> = (props: IStintLapsProps) => {
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
  return (
    <>
      {header()}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Table" key="1">
          <StintLapsTable {...props} />
        </TabPane>
        <TabPane tab="Graph" key="2">
          <StintLapsGraph {...props} />
        </TabPane>
      </Tabs>
    </>
  );
};
export default StintLaps;
