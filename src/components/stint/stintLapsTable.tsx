import { Descriptions } from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import _ from "lodash";
import React from "react";
import { sprintf } from "sprintf-js";
import { IRaceContainer } from "../../stores/raceevents/types";
import { ILaptimeExtended } from "../../stores/types/laptimes";
import { IStintData } from "../../stores/types/stints";
import { lapTimeString } from "../../utils/output";
import { closestDriverEntryByTime, stintDuration } from "../util/common";

interface IStintLapsProps {
  stint: IStintData;
  raceContainer: IRaceContainer;
}

const StintLapsTable: React.FC<IStintLapsProps> = (props: IStintLapsProps) => {
  const dings = (d: ILaptimeExtended): string => {
    return closestDriverEntryByTime(props.raceContainer.drivers, d.lapData.carIdx, d.sessionNum, d.sessionTime)
      .userName;
  };
  const columns: ColumnsType<ILaptimeExtended> = [
    { key: "lapNo", title: "Lap", align: "right", dataIndex: ["lapData", "lapNo"], render: (d) => d },
    { key: "stintLap", title: "StintLap", align: "right", render: (d) => props.stint.laps.indexOf(d) + 1 },
    { key: "driver", title: "Driver", align: "left", render: (d) => dings(d) },
    {
      key: "laptime",
      title: "Laptime",
      align: "right",
      dataIndex: ["lapData", "lapTime"],
      render: (d) => lapTimeString(d),
    },
    {
      title: "Averages",
      children: [
        {
          key: "rollAvg",
          title: "Overall",
          align: "right",
          dataIndex: ["rollAvg"],
          render: (d) => lapTimeString(d),
        },
        {
          key: "rollAvgFiltered",
          title: "Filtered",
          align: "right",
          dataIndex: ["rollAvgFiltered"],
          render: (d) => lapTimeString(d),
        },
      ],
    },
    {
      key: "filter",
      title: "Filtered",
      align: "left",
      dataIndex: ["filtered"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "in",
      title: "Inlap",
      align: "left",
      dataIndex: ["lapData", "inLap"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "out",
      title: "Outlap",
      align: "left",
      dataIndex: ["lapData", "outLap"],
      render: (d) => (d ? "yes" : ""),
    },
    {
      key: "incomplete",
      title: "Incomplete",
      align: "left",
      dataIndex: ["lapData", "incomplete"],
      render: (d) => (d ? "yes" : ""),
    },
  ];

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
    <Table
      size="small"
      pagination={false}
      dataSource={props.stint.laps}
      // title={header}
      columns={columns}
      rowKey={(d) => sprintf("sll-%d", _.uniqueId())}
    />
  );
};
export default StintLapsTable;
